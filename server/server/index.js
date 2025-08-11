import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

// load wallet keypair
const keypairPath = path.resolve(process.env.WALLET_KEYPAIR_PATH || "./wallet/authority.json");
if (!fs.existsSync(keypairPath)) {
  console.error("Wallet keypair not found at", keypairPath);
  process.exit(1);
}
const secretKeyString = fs.readFileSync(keypairPath, { encoding: "utf-8" });
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
const authorityKeypair = Keypair.fromSecretKey(secretKey);

// env values
const RPC_URL = process.env.RPC_URL || clusterApiUrl("devnet");
const CANDY_MACHINE_ID = new PublicKey(process.env.CANDY_MACHINE_ID);
const COLLECTION_UPDATE_AUTHORITY = new PublicKey(process.env.COLLECTION_UPDATE_AUTHORITY);

// metaplex client
const connection = new Connection(RPC_URL, "confirmed");
const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));

// simple auth middleware using API_SECRET (optional but recommended)
function requireApiSecret(req, res, next) {
  const secret = req.headers["x-api-secret"] || req.query.secret || "";
  if (!process.env.API_SECRET) return next(); // no secret configured => open (not recommended)
  if (secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * GET /api/candy-machine
 * returns basic candy machine info (price, supply, minted, startTime, etc).
 */
app.get("/api/candy-machine", async (req, res) => {
  try {
    // find candy machine
    const candyMachine = await metaplex.candyMachines().findByAddress({ address: CANDY_MACHINE_ID });
    // try to read some helpful info; shape depends on your candy machine config
    const total = candyMachine.itemsAvailable ?? null;
    const minted = candyMachine.itemsMinted ?? null;
    const price = candyMachine.price?.basisPoints ? (Number(candyMachine.price.basisPoints) / 1e9) : null; // maybe null if guarded
    // start time isn't always available from the candy machine directly (depends on guards)
    return res.json({
      price,
      totalSupply: total,
      minted,
      // you can add more fields as needed
    });
  } catch (err) {
    console.error("Failed to fetch candy machine", err);
    return res.status(500).json({ error: "Failed to fetch candy machine" });
  }
});

/**
 * POST /api/mint
 * body: { quantity: number, walletAddress: string }
 * - mints `quantity` items from the candy machine (1 by default), then transfers each minted NFT to walletAddress
 */
app.post("/api/mint", requireApiSecret, async (req, res) => {
  try {
    const { quantity = 1, walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "Missing walletAddress" });
    const buyer = new PublicKey(walletAddress);

    // load candy machine
    const candyMachine = await metaplex.candyMachines().findByAddress({ address: CANDY_MACHINE_ID });

    const results = [];

    for (let i = 0; i < quantity; i++) {
      // Mint an NFT — this mints to the authority wallet by default
      const mintOut = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: COLLECTION_UPDATE_AUTHORITY,
      });

      // mintOut.response is the rpc response (signature), mintOut.nft is the minted NFT model
      const mintSig = mintOut.response?.signature ?? null;
      const mintedNft = mintOut.nft ?? null;

      // transfer minted NFT from authority to buyer
      // note: metaplex.nfts().transfer expects nftOrSft as MintAddress or object and toOwner
      if (mintedNft) {
        await metaplex.nfts().transfer({
          nftOrSft: mintedNft,
          toOwner: buyer,
        });
      }

      results.push({
        mintSignature: mintSig,
        mintAddress: mintedNft?.address?.toBase58?.() ?? null,
      });
    }

    return res.json({ success: true, results });
  } catch (err) {
    console.error("Mint error:", err);
    return res.status(500).json({ error: (err && err.message) ? err.message : String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Mint server running on http://localhost:${PORT}`);
});

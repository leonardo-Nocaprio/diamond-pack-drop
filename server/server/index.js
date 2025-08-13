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

// Load wallet keypair
const keypairPath = path.resolve(process.env.WALLET_KEYPAIR_PATH || "./wallet/authority.json");
if (!fs.existsSync(keypairPath)) {
  console.error("❌ Wallet keypair not found at", keypairPath);
  process.exit(1);
}

const secretKeyString = fs.readFileSync(keypairPath, { encoding: "utf-8" });
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
const authorityKeypair = Keypair.fromSecretKey(secretKey);

// Environment values
const RPC_URL = process.env.RPC_URL || clusterApiUrl("devnet");
const CANDY_MACHINE_ID = new PublicKey(process.env.CANDY_MACHINE_ID);
const COLLECTION_UPDATE_AUTHORITY = new PublicKey(process.env.COLLECTION_UPDATE_AUTHORITY);

// Metaplex client
const connection = new Connection(RPC_URL, "confirmed");
const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));

// Simple auth middleware using API_SECRET
function requireApiSecret(req, res, next) {
  const secret = req.headers["x-api-secret"] || req.query.secret || "";
  if (!process.env.API_SECRET) return next();
  if (secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Routes
app.get("/api/candy-machine", async (req, res) => {
  try {
    const candyMachine = await metaplex.candyMachines().findByAddress({ address: CANDY_MACHINE_ID });
    const total = candyMachine.itemsAvailable ?? null;
    const minted = candyMachine.itemsMinted ?? null;
    const price = candyMachine.price?.basisPoints ? (Number(candyMachine.price.basisPoints) / 1e9) : null;
    return res.json({ price, totalSupply: total, minted });
  } catch (err) {
    console.error("❌ Failed to fetch candy machine:", err);
    return res.status(500).json({ error: "Failed to fetch candy machine" });
  }
});

app.post("/api/mint", requireApiSecret, async (req, res) => {
  try {
    const { quantity = 1, walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "Missing walletAddress" });
    const buyer = new PublicKey(walletAddress);

    const candyMachine = await metaplex.candyMachines().findByAddress({ address: CANDY_MACHINE_ID });
    const results = [];

    for (let i = 0; i < quantity; i++) {
      const mintOut = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: COLLECTION_UPDATE_AUTHORITY,
      });

      const mintSig = mintOut.response?.signature ?? null;
      const mintedNft = mintOut.nft ?? null;

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
    console.error("❌ Mint error:", err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
});

// Start server with Railway-friendly binding
app.listen(PORT, () => {
  console.log(`🚀 Mint server running on port ${PORT}`);
}).on("error", (err) => {
  console.error("❌ Server failed to start:", err);
});

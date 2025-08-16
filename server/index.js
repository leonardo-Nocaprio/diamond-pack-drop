import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint (required for Railway)
app.get("/healthz", (_req, res) => res.send("ok"));

// Optional root endpoint
app.get("/", (_req, res) => res.send("Server is running!"));

// Wallet keypair path
const keypairPath = path.resolve(
  process.env.WALLET_KEYPAIR_PATH || path.join(__dirname, "wallet", "authority.json")
);

if (!fs.existsSync(keypairPath)) {
  console.error("❌ Wallet keypair not found at", keypairPath);
  process.exit(1);
}

// Load wallet
let authorityKeypair;
try {
  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf-8")));
  authorityKeypair = Keypair.fromSecretKey(secretKey);
} catch {
  console.error("❌ Invalid keypair file format");
  process.exit(1);
}

// RPC & IDs
const RPC_URL = process.env.RPC_URL || clusterApiUrl("devnet");
const CANDY_MACHINE_ID = new PublicKey(process.env.CANDY_MACHINE_ID);
const COLLECTION_UPDATE_AUTHORITY = new PublicKey(process.env.COLLECTION_UPDATE_AUTHORITY);

// Metaplex instance
const connection = new Connection(RPC_URL, "confirmed");
const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));

// Middleware for API secret
function requireApiSecret(req, res, next) {
  if (!process.env.API_SECRET) return next();
  const secret = req.headers["x-api-secret"] || req.query.secret || "";
  if (secret !== process.env.API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// GET candy machine info
app.get("/api/candy-machine", async (req, res) => {
  try {
    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: CANDY_MACHINE_ID });

    const total = candyMachine.itemsAvailable ?? null;
    const minted = candyMachine.itemsMinted ?? null;
    const price = candyMachine.price?.basisPoints
      ? Number(candyMachine.price.basisPoints) / 1e9
      : null;

    res.json({ price, totalSupply: total, minted });
  } catch (err) {
    console.error("❌ Failed to fetch candy machine:", err);
    res.status(500).json({ error: "Failed to fetch candy machine" });
  }
});

// POST mint endpoint
app.post("/api/mint", requireApiSecret, async (req, res) => {
  try {
    const { quantity = 1, walletAddress } = req.body;
    if (!walletAddress) return res.status(400).json({ error: "Missing walletAddress" });

    const buyer = new PublicKey(walletAddress);

    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: CANDY_MACHINE_ID });

    const results = [];

    for (let i = 0; i < quantity; i++) {
      const mintKeypair = Keypair.generate();

      const mintOut = await metaplex.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: COLLECTION_UPDATE_AUTHORITY,
        nftMint: mintKeypair, // Required in newer versions
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

    res.json({ success: true, results });
  } catch (err) {
    console.error("❌ Mint error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Mint server running on port ${PORT}`);
});

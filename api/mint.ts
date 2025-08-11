import { NextApiRequest, NextApiResponse } from "next";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";
import path from "path";

// Load your wallet keypair JSON - replace with your actual path or env var method
const keypairPath = path.resolve("./wallet/authority.json");
const secretKeyString = fs.readFileSync(keypairPath, { encoding: "utf-8" });
const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
const authorityKeypair = Keypair.fromSecretKey(secretKey);

// Your Candy Machine ID and cluster RPC (can also come from env)
const CANDY_MACHINE_ID = new PublicKey(process.env.CANDY_MACHINE_ID!);
const COLLECTION_UPDATE_AUTHORITY = new PublicKey(process.env.COLLECTION_UPDATE_AUTHORITY!);
const RPC_ENDPOINT = process.env.RPC_URL || clusterApiUrl("devnet");

const connection = new Connection(RPC_ENDPOINT);

const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userPublicKey } = req.body;

  if (!userPublicKey) {
    return res.status(400).json({ error: "Missing user public key" });
  }

  try {
    const candyMachine = await metaplex
      .candyMachines()
      .findByAddress({ address: CANDY_MACHINE_ID });

    const { nft, response } = await metaplex.candyMachines().mint({
      candyMachine,
      collectionUpdateAuthority: COLLECTION_UPDATE_AUTHORITY,
    });

    return res.status(200).json({ txSignature: response.signature });
  } catch (error: any) {
    console.error("Mint error:", error);
    return res.status(500).json({ error: error.message || "Mint failed" });
  }
}


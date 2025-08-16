import { ENV } from "@/config/env";

export interface CandyMachineInfo {
  price: number; // SOL per pack
  totalSupply: number;
  minted: number;
  startTime?: string; // ISO string
  whitelist?: boolean;
}

export async function getCandyMachineInfo(): Promise<CandyMachineInfo> {
  if (!ENV.BACKEND_URL) {
    // Frontend placeholder when backend not set
    return {
      price: 0.5,
      totalSupply: 3333,
      minted: 0,
      startTime: new Date(Date.now() - 60_000).toISOString(),
      whitelist: false,
    };
  }
  const res = await fetch(`${ENV.BACKEND_URL}/api/candy-machine`);
  if (!res.ok) throw new Error("Failed to load candy machine info");
  return res.json();
}

export async function mintPacks(quantity: number, walletAddress: string): Promise<{ txSignature: string; images?: string[] }>{
  if (!ENV.BACKEND_URL) {
    // Simulate a successful mint on demo
    return {
      txSignature: "DEMO_SIGNATURE",
      images: [],
    };
  }
  const res = await fetch(`${ENV.BACKEND_URL}/api/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity, walletAddress }),
  });
  if (!res.ok) throw new Error("Mint failed");
  return res.json();
}

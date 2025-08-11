export const ENV = {
  NETWORK: import.meta.env.VITE_SOLANA_NETWORK || "devnet",
  RPC_URL: import.meta.env.VITE_SOLANA_RPC || "https://api.devnet.solana.com",
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "",
  CANDY_MACHINE_ID: import.meta.env.VITE_CANDY_MACHINE_ID || "",
  COLLECTION_MINT: import.meta.env.VITE_COLLECTION_MINT || "",
  COLLECTION_UPDATE_AUTHORITY: import.meta.env.VITE_COLLECTION_UPDATE_AUTHORITY || "",
};

export const EXPLORER = (sig: string) => {
  const clusterParam = ENV.NETWORK === "mainnet-beta" ? "" : `?cluster=${ENV.NETWORK}`;
  return `https://explorer.solana.com/tx/${sig}${clusterParam}`;
};

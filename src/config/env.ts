export const ENV = {
  NETWORK: (import.meta.env.VITE_SOLANA_NETWORK as string) || "devnet",
  RPC_URL: (import.meta.env.VITE_RPC_URL as string) || "https://api.devnet.solana.com",
  BACKEND_URL: (import.meta.env.VITE_BACKEND_URL as string) || "",
};

export const EXPLORER = (sig: string) => {
  const clusterParam = ENV.NETWORK === "mainnet-beta" ? "" : `?cluster=${ENV.NETWORK}`;
  return `https://explorer.solana.com/tx/${sig}${clusterParam}`;
};

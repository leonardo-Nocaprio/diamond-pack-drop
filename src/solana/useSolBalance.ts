import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const useSolBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!publicKey) {
        if (mounted) setBalance(null);
        return;
      }
      const lamports = await connection.getBalance(publicKey as PublicKey, { commitment: "confirmed" });
      if (mounted) setBalance(lamports / LAMPORTS_PER_SOL);
    };
    load();
  }, [connection, publicKey]);

  return { balance, publicKey };
};

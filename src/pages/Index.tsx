import React, { useState, useCallback } from "react";
import NeonHeader from "@/components/NeonHeader";
import PackMintFrame from "@/components/PackMintFrame";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";

const LOGO_SRC = "/lovable-uploads/c7fb3044-11d4-47ce-9a1b-e194dd45b8be.png";

// Use your Railway URL if set; otherwise same-origin (useful in Lovable dev)
const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

function b64ToUint8Array(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const Index = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [minting, setMinting] = useState(false);

  const handleMint = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!wallet.signTransaction) {
      alert("Your wallet cannot sign transactions here. Please use Phantom or a wallet that supports `signTransaction`.");
      return;
    }

    setMinting(true);
    try {
      // 1) Ask backend for a prepared mint transaction
      const res = await fetch(`${API_BASE}/api/mint-tx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer: wallet.publicKey.toBase58(),
          quantity: 1, // change if you support multi-mint
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to get mint transaction");

      // 2) Decode tx and ask wallet to sign
      const raw = b64ToUint8Array(json.transaction);
      const tx = Transaction.from(raw);
      const signed = await wallet.signTransaction(tx);

      // 3) Send & confirm
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      alert(`✅ Mint successful! Signature: ${sig}`);
    } catch (err: any) {
      console.error("Mint error:", err);
      alert(`Mint failed: ${err?.message || String(err)}`);
    } finally {
      setMinting(false);
    }
  }, [wallet, connection]);

  return (
    <div className="min-h-screen">
      <NeonHeader />
      <main>
        <section className="container mx-auto pt-16 pb-12 text-center">
          <div className="mx-auto max-w-3xl">
            <img
              src={LOGO_SRC}
              alt="Diamond Nutted Nation neon logo"
              className="mx-auto h-24 w-24 rounded-full mb-6 hover-scale"
            />
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              Diamond Nutted Nation — Mint Solana NFT Packs
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Rip open a neon pack and reveal 3 NFTs. Use them in our play-to-earn game to win SOL and other crypto.
            </p>

            <button
              onClick={handleMint}
              disabled={!wallet.connected || minting}
              className="btn-glow shine-mask rounded-md px-8 py-3 bg-gradient-to-r from-[hsl(var(--glow-magenta))] via-[hsl(var(--primary))] to-[hsl(var(--glow-cyan))] text-primary-foreground text-sm font-semibold tracking-wide uppercase hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {minting ? "Minting..." : "Mint a Pack"}
            </button>

            <WalletMultiButton className="mb-2" />

            {wallet.connected && (
              <p className="text-sm text-muted-foreground">
                Connected wallet: {wallet.publicKey?.toBase58()}
              </p>
            )}
          </div>
        </section>

        <PackMintFrame />

        <section id="about" className="container mx-auto py-16">
          <article className="max-w-3xl mx-auto text-left space-y-4">
            <h2 className="text-2xl font-semibold">About Diamond Nutted Nation</h2>
            <p className="text-muted-foreground">
              Diamond Nutted Nation is a neon-charged collection designed for on-chain utility. Each pack contains three NFTs engineered for our play-to-earn game. Compete, climb leaderboards, and win SOL or other crypto rewards.
            </p>
          </article>
        </section>

        <section id="faq" className="container mx-auto pb-24">
          <article className="max-w-3xl mx-auto grid gap-6 text-left">
            <h2 className="text-2xl font-semibold">FAQ</h2>
            <div>
              <h3 className="text-lg font-semibold">How many NFTs per pack?</h3>
              <p className="text-muted-foreground">Three NFTs per pack. You can mint up to 10 packs at a time.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">When will I see my NFTs?</h3>
              <p className="text-muted-foreground">
                Immediately after mint, you’ll get a pack opening animation and a reveal. Final metadata will load in your wallet/marketplace shortly after confirmation.
              </p>
            </div>
          </article>
        </section>
      </main>
      <footer className="container mx-auto py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Diamond Nutted Nation. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;

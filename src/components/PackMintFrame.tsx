import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import PackOpenAnimation from "./PackOpenAnimation";
import { useQuery } from "@tanstack/react-query";
import { getCandyMachineInfo, mintPacks } from "@/lib/api";
import { useWallet } from "@solana/wallet-adapter-react";
import { EXPLORER } from "@/config/env";

import card1 from "@/assets/cards/card1.jpg";
import card2 from "@/assets/cards/card2.jpg";
import card3 from "@/assets/cards/card3.jpg";

const demoCards = [card1, card2, card3];

const useCountdown = (iso?: string) => {
  if (!iso) return { now: Date.now(), startAt: 0, remaining: 0 };
  const startAt = new Date(iso).getTime();
  const now = Date.now();
  const remaining = Math.max(startAt - now, 0);
  return { now, startAt, remaining };
};

export const PackMintFrame = () => {
  const { data } = useQuery({ queryKey: ["cm-info"], queryFn: getCandyMachineInfo, refetchInterval: 10_000 });
  const info = data ?? { price: 0.5, totalSupply: 3333, minted: 0 };

  const [qty, setQty] = useState(1);
  const [opening, setOpening] = useState(false);
  const [justMintedSig, setJustMintedSig] = useState<string | null>(null);

  const { publicKey } = useWallet();

  const remainingSupply = Math.max((info.totalSupply ?? 0) - (info.minted ?? 0), 0);
  const progress = info.totalSupply ? Math.min(100, ((info.minted ?? 0) / info.totalSupply) * 100) : 0;

  const { remaining } = useCountdown(info.startTime);
  const saleNotStarted = (info.startTime && remaining > 0) || false;

  const handleQty = (delta: number) => setQty((q) => Math.min(10, Math.max(1, q + delta)));

  const handleMint = async () => {
    if (!publicKey) {
      toast.error("Connect your wallet to mint");
      return;
    }
    try {
      toast("Minting pack… confirm in wallet if prompted.");
      const res = await mintPacks(qty, publicKey.toBase58());
      setJustMintedSig(res.txSignature);
      setOpening(true);
      toast.success(
        res.txSignature === "DEMO_SIGNATURE" ?
        "Mint simulated (demo)." :
        "Mint successful!",
        {
          action: res.txSignature ? {
            label: "View Tx",
            onClick: () => window.open(EXPLORER(res.txSignature), "_blank")
          } : undefined
        }
      );
    } catch (e: any) {
      toast.error(e?.message || "Mint failed");
    }
  };

  const revealImages = useMemo(() => Array.from({ length: qty * 3 }, (_, i) => demoCards[i % demoCards.length]), [qty]);

  const disabled = saleNotStarted || remainingSupply <= 0;

  return (
    <section id="mint" className="container mx-auto mt-12">
      <Card className="neon-border neon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">Mint Pack</span>
            <span className="text-sm text-muted-foreground">3 NFTs per pack</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Price / Pack</div>
                <div className="text-xl font-semibold">{info.price?.toString()} SOL</div>
              </div>
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Total Supply</div>
                <div className="text-xl font-semibold">{info.totalSupply ?? "-"}</div>
              </div>
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Minted</div>
                <div className="text-xl font-semibold">{info.minted ?? "-"}</div>
              </div>
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Remaining</div>
                <div className="text-xl font-semibold">{remainingSupply}</div>
              </div>
            </div>

            {info.startTime && (
              <div className="rounded-xl neon-border neon-card p-4 text-center">
                {saleNotStarted ? (
                  <div>
                    <div className="text-xs text-muted-foreground">Sale starts in</div>
                    <Countdown ms={remaining} />
                  </div>
                ) : (
                  <div className="text-sm text-accent-foreground">Sale is live</div>
                )}
              </div>
            )}

            <div>
              <div className="h-2 w-full rounded-full bg-secondary/40 overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{progress.toFixed(1)}% minted</div>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleQty(-1)} aria-label="Decrease quantity">-</Button>
                <Input
                  className="w-20 text-center"
                  type="number"
                  value={qty}
                  min={1}
                  max={10}
                  onChange={(e) => setQty(Math.min(10, Math.max(1, Number(e.target.value))))}
                />
                <Button variant="outline" onClick={() => handleQty(1)} aria-label="Increase quantity">+</Button>
              </div>

              <Button variant="hero" size="lg" className="px-10" onClick={handleMint} disabled={disabled}>
                {remainingSupply <= 0 ? "Sold Out" : saleNotStarted ? "Mint Soon" : "Mint Pack"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">You will receive 3 NFTs per pack. Max 10 packs per transaction.</p>
            {justMintedSig && (
              <div className="text-xs">
                View transaction:
                <a className="ml-2 story-link" href={EXPLORER(justMintedSig)} target="_blank" rel="noreferrer">Explorer</a>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Preview</div>
            <div className="grid grid-cols-3 gap-2">
              {demoCards.map((src, i) => (
                <img key={i} src={src} alt={`Preview ${i + 1}`} className="rounded-lg object-cover h-28 w-full neon-border" loading="lazy" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Artwork shown is a style preview. Your actual NFT will be revealed after mint.</p>
          </div>
        </CardContent>
      </Card>

      <PackOpenAnimation open={opening} onClose={() => setOpening(false)} images={revealImages} />
    </section>
  );
};

const Countdown = ({ ms }: { ms: number }) => {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return (
    <div className="text-xl font-semibold tracking-wide">
      {d}d {h}h {m}m {sec}s
    </div>
  );
};

export default PackMintFrame;

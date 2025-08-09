import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import PackOpenAnimation from "./PackOpenAnimation";

import card1 from "@/assets/cards/card1.jpg";
import card2 from "@/assets/cards/card2.jpg";
import card3 from "@/assets/cards/card3.jpg";

const demoCards = [card1, card2, card3];

interface PackMintFrameProps {
  price?: number; // SOL per pack
  totalSupply?: number;
  minted?: number;
}

export const PackMintFrame = ({ price = 0.5, totalSupply = 3333, minted: mintedProp = 0 }: PackMintFrameProps) => {
  const [qty, setQty] = useState(1);
  const [minted, setMinted] = useState(mintedProp);
  const [opening, setOpening] = useState(false);

  const remaining = Math.max(totalSupply - minted, 0);
  const progress = Math.min(100, (minted / totalSupply) * 100);

  const handleQty = (delta: number) => {
    setQty((q) => Math.min(10, Math.max(1, q + delta)));
  };

  const handleMint = async () => {
    // Placeholder UX — replace with real mint integration
    setOpening(true);
    const mintedPacks = qty;
    setMinted((m) => Math.min(totalSupply, m + mintedPacks));
    toast("Pack minted! Revealing your cards…");
  };

  const revealImages = useMemo(() => {
    // 3 NFTs per pack
    const total = qty * 3;
    return Array.from({ length: total }, (_, i) => demoCards[i % demoCards.length]);
  }, [qty]);

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
                <div className="text-xl font-semibold">{price} SOL</div>
              </div>
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Total Supply</div>
                <div className="text-xl font-semibold">{totalSupply}</div>
              </div>
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Minted</div>
                <div className="text-xl font-semibold">{minted}</div>
              </div>
              <div className="p-4 rounded-xl neon-border neon-card text-center">
                <div className="text-xs text-muted-foreground">Remaining</div>
                <div className="text-xl font-semibold">{remaining}</div>
              </div>
            </div>

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

              <Button variant="hero" size="lg" className="px-10" onClick={handleMint}>
                Mint Pack
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">You will receive 3 NFTs per pack. Max 10 packs per transaction.</p>
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

export default PackMintFrame;

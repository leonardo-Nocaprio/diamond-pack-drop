import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PackOpenAnimationProps {
  open: boolean;
  onClose: () => void;
  images: string[]; // list of revealed NFT images
}

export const PackOpenAnimation = ({ open, onClose, images }: PackOpenAnimationProps) => {
  const [stage, setStage] = useState<"pack" | "reveal">("pack");

  useEffect(() => {
    if (!open) return;
    setStage("pack");
    const t = setTimeout(() => setStage("reveal"), 850);
    return () => clearTimeout(t);
  }, [open]);

  const shown = useMemo(() => images.slice(0, 9), [images]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl bg-transparent border-none">
        <DialogHeader>
          <DialogTitle className="sr-only">Pack Opening</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col items-center justify-center">
          {stage === "pack" && (
            <div className="neon-border neon-card w-[520px] h-[300px] flex items-center justify-center animate-pack-rip">
              <div className="text-center">
                <div className="text-xl font-semibold tracking-wide">Minting Pack…</div>
                <div className="text-sm text-muted-foreground">Tearing the seal</div>
              </div>
            </div>
          )}

          {stage === "reveal" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
              {shown.map((src, i) => (
                <Card
                  key={i}
                  className="neon-border neon-card overflow-hidden hover-tilt opacity-0 animate-card-enter"
                  style={{ animationDelay: `${100 + i * 120}ms` }}
                >
                  <img src={src} alt={`Revealed NFT ${i + 1}`} className="w-full h-[360px] object-cover" loading="lazy" />
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Button variant="neon" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackOpenAnimation;

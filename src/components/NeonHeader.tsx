import { useState } from "react";
import { Button } from "@/components/ui/button";

const LOGO_SRC = "/lovable-uploads/c7fb3044-11d4-47ce-9a1b-e194dd45b8be.png";

export const NeonHeader = () => {
  const [connected, setConnected] = useState(false);

  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur-md">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <a href="#" className="flex items-center gap-3 group">
          <img
            src={LOGO_SRC}
            alt="Diamond Nutted Nation logo"
            className="h-10 w-10 rounded-full ring-1 ring-accent/30 group-hover:scale-105 transition"
            loading="eager"
          />
          <span className="text-lg font-semibold tracking-wide">Diamond Nutted Nation</span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#mint" className="story-link">Mint</a>
          <a href="#about" className="story-link">About</a>
          <a href="#faq" className="story-link">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          {connected ? (
            <Button variant="neon" size="sm" onClick={() => setConnected(false)}>
              Connected • DEMO...WALLET
            </Button>
          ) : (
            <Button variant="neon" size="sm" onClick={() => setConnected(true)}>
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NeonHeader;

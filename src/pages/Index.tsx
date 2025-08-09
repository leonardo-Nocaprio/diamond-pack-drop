import NeonHeader from "@/components/NeonHeader";
import PackMintFrame from "@/components/PackMintFrame";

const LOGO_SRC = "/lovable-uploads/c7fb3044-11d4-47ce-9a1b-e194dd45b8be.png";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NeonHeader />
      <main>
        <section className="container mx-auto pt-16 pb-12 text-center">
          <div className="mx-auto max-w-3xl">
            <img src={LOGO_SRC} alt="Diamond Nutted Nation neon logo" className="mx-auto h-24 w-24 rounded-full mb-6 hover-scale" />
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Diamond Nutted Nation — Mint Solana NFT Packs</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">Rip open a neon pack and reveal 3 NFTs. Use them in our play‑to‑earn game to win SOL and other crypto.</p>
            <a href="#mint" className="inline-block">
              <span className="sr-only">Jump to mint</span>
              <button className="btn-glow shine-mask rounded-md px-8 py-3 bg-gradient-to-r from-[hsl(var(--glow-magenta))] via-[hsl(var(--primary))] to-[hsl(var(--glow-cyan))] text-primary-foreground text-sm font-semibold tracking-wide uppercase hover:opacity-95 transition">Mint a Pack</button>
            </a>
          </div>
        </section>

        <PackMintFrame />

        <section id="about" className="container mx-auto py-16">
          <article className="max-w-3xl mx-auto text-left space-y-4">
            <h2 className="text-2xl font-semibold">About Diamond Nutted Nation</h2>
            <p className="text-muted-foreground">Diamond Nutted Nation is a neon‑charged collection designed for on‑chain utility. Each pack contains three NFTs engineered for our play‑to‑earn game. Compete, climb leaderboards, and win SOL or other crypto rewards.</p>
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
              <p className="text-muted-foreground">Immediately after mint, you’ll get a pack opening animation and a reveal. Final metadata will load in your wallet/marketplace shortly after confirmation.</p>
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

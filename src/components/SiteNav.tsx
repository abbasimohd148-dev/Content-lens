import { Link } from "@tanstack/react-router";
import { Aperture } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Aperture className="h-4.5 w-4.5" strokeWidth={2.25} />
      </span>
      <span>Content<span className="text-primary">Lens</span></span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <Link to="/" hash="product" className="hover:text-foreground">Product</Link>
          <Link to="/" hash="how" className="hover:text-foreground">How It Works</Link>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/login" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">Login</Link>
          <Link to="/signup" className="rounded-md bg-ink px-4 py-2 font-medium text-ink-foreground hover:opacity-90">Get Started</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <Logo />
        <p>© {new Date().getFullYear()} ContentLens. Insights from your own data — no viral promises.</p>
      </div>
    </footer>
  );
}

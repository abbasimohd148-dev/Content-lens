import { Link } from "@tanstack/react-router";

export function SiteNav() {
  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm">H</span>
          HookForge
        </Link>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="/#product" className="hover:text-foreground">Product</a>
          <a href="/#how" className="hover:text-foreground">How It Works</a>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-md px-3 py-2 text-muted-foreground" title="Available once the backend is connected">Login</span>
          <Link to="/pricing" className="rounded-md bg-ink px-4 py-2 font-medium text-ink-foreground hover:opacity-90">Get Started</Link>
        </div>
      </div>
    </header>
  );
}

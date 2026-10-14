import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/SiteNav";

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold">{isLogin ? "Welcome back" : "Create your ContentLens account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{isLogin ? "Log in to see your content insights." : "Start learning what works for your audience."}</p>
        <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder="you@example.com" className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <input type="password" required placeholder="Password" className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button disabled className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground opacity-60">{isLogin ? "Log in" : "Sign up"}</button>
          <p className="text-center text-xs text-muted-foreground">Accounts open once the backend is connected.</p>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "New to ContentLens? " : "Already have an account? "}
          <Link to={isLogin ? "/signup" : "/login"} className="font-medium text-primary hover:underline">{isLogin ? "Sign up" : "Log in"}</Link>
        </p>
      </div>
    </div>
  );
}

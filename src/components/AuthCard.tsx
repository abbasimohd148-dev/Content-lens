import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/SiteNav";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

// Placeholder for Google OAuth — wire up to the auth provider when the backend is connected.
function handleGoogleSignIn() {
  // TODO: initiate Google OAuth flow here (e.g. supabase.auth.signInWithOAuth({ provider: "google" })).
}

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  return (
    <div className="grid min-h-screen place-items-center bg-secondary/50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <Logo />
        <h1 className="mt-6 text-2xl font-semibold">{isLogin ? "Welcome back" : "Create your ContentLens account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{isLogin ? "Log in to see your content insights." : "Start learning what works for your audience."}</p>
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-secondary/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <GoogleLogo className="h-4.5 w-4.5" />
            Continue with Google
          </button>
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input type="email" required placeholder="you@example.com" className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <input type="password" required placeholder="Password" className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button disabled className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground opacity-60">{isLogin ? "Log in" : "Sign up"}</button>
            <p className="text-center text-xs text-muted-foreground">Accounts open once the backend is connected.</p>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "New to ContentLens? " : "Already have an account? "}
          <Link to={isLogin ? "/signup" : "/login"} className="font-medium text-primary hover:underline">{isLogin ? "Sign up" : "Log in"}</Link>
        </p>
      </div>
    </div>
  );
}

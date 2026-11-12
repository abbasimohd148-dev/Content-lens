import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in...");

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        let session = data.session;

        // Support OAuth authorization-code callbacks too.
        if (!session && window.location.search.includes("code=")) {
          const code = new URLSearchParams(window.location.search).get("code");

          if (code) {
            const { data: exchanged, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) throw exchangeError;
            session = exchanged.session;
          }
        }

        // The implicit flow can return tokens in the URL fragment.
        if (!session && window.location.hash.includes("access_token=")) {
          const { data: refreshed, error: refreshError } =
            await supabase.auth.getSession();

          if (refreshError) throw refreshError;
          session = refreshed.session;
        }

        if (!session) {
          throw new Error(
            "No session was found. Please try signing in with Google again."
          );
        }

        if (active) {
          await navigate({ to: "/dashboard", replace: true });
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Sign-in failed. Please try again."
          );
        }
      }
    }

    void completeSignIn();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-secondary/50 px-4">
      <div className="w-full max-w-md space-y-3 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">ContentLens</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </main>
  );
}
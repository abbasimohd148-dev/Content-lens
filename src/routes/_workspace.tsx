import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { ImportCsvDialog } from "@/components/app/ImportCsvDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_workspace")({
  component: Workspace,
});

function Workspace() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setCheckingSession(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;

        if (error) {
          console.error("Unable to read Supabase session:", error.message);
          setUser(null);
        } else {
          setUser(data.session?.user ?? null);
        }

        setCheckingSession(false);
      })
      .catch((error: unknown) => {
        if (!mounted) return;

        console.error("Unable to load Supabase session:", error);
        setUser(null);
        setCheckingSession(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout failed:", error.message);
        return;
      }

      await navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  const email = user?.email ?? "";
  const initials =
    email
      .split("@")[0]
      ?.split(/[._\-\s]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "CL";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="min-w-0">
          <header className="sticky top-0 z-10 flex h-12 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="mx-1 h-4 w-px bg-border" />

            <span className="truncate text-sm text-muted-foreground">
              My first project
            </span>

            <div className="ml-auto flex items-center gap-2">
              <ImportCsvDialog>
                <Button variant="outline" size="sm">
                  <Upload />
                  <span className="hidden sm:inline">Import CSV</span>
                </Button>
              </ImportCsvDialog>

              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Account menu"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">
                      {checkingSession
                        ? "Checking account..."
                        : user
                          ? "Signed in"
                          : "Not signed in"}
                    </p>

                    <p className="break-all text-xs text-muted-foreground">
                      {checkingSession
                        ? "Loading account details"
                        : email || "Please log in to your account"}
                    </p>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {user ? (
                    <DropdownMenuItem
                      disabled={loggingOut}
                      onSelect={(event) => {
                        event.preventDefault();
                        void handleLogout();
                      }}
                    >
                      <LogOut />
                      {loggingOut ? "Logging out..." : "Log out"}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/login">
                        <LogOut />
                        Log in
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
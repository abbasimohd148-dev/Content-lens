import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  UserRound,
  ShieldCheck,
  SlidersHorizontal,
  LogOut,
  Save,
  Loader2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_workspace/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ContentLens" },
      {
        name: "description",
        content: "Manage your creator profile and account preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

type Preferences = {
  displayName: string;
  platform: "YouTube";
};

const DEFAULT_PREFERENCES: Preferences = {
  displayName: "",
  platform: "YouTube",
};

const STORAGE_KEY = "contentlens-creator-preferences";

function SettingsPage() {
  const navigate = useNavigate();

  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (!user) {
          if (active) {
            await navigate({ to: "/login", replace: true });
          }
          return;
        }

        let storedDisplayName: string | undefined;

        try {
          const raw = localStorage.getItem(
            `${STORAGE_KEY}:${user.id}`,
          );

          if (raw) {
            const parsed: unknown = JSON.parse(raw);

            if (
              parsed !== null &&
              typeof parsed === "object" &&
              !Array.isArray(parsed)
            ) {
              const stored = parsed as Record<string, unknown>;

              if (typeof stored["displayName"] === "string") {
                storedDisplayName = stored["displayName"];
              }
            }
          }
        } catch {
          // Ignore invalid locally stored preferences.
        }

        if (!active) return;

        const metadata = user.user_metadata as Record<string, unknown>;

        const metadataName =
          typeof metadata["full_name"] === "string"
            ? metadata["full_name"]
            : typeof metadata["name"] === "string"
              ? metadata["name"]
              : "";

        setEmail(user.email ?? "");
        setUserId(user.id);

        setPreferences({
          displayName: storedDisplayName ?? metadataName,
          platform: "YouTube",
        });
      } catch {
        if (active) {
          toast.error("Couldn't load your account settings.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSettings();

    return () => {
      active = false;
    };
  }, [navigate]);

  function updateDisplayName(value: string) {
    setPreferences((current) => ({
      ...current,
      displayName: value,
    }));

    setSaved(false);
  }

  async function saveSettings() {
    if (saving) return;

    if (!userId) {
      toast.error(
        "Your account session was not found. Please sign in again.",
      );
      return;
    }

    setSaving(true);

    try {
      const preferencesToSave: Preferences = {
        displayName: preferences.displayName.trim(),
        platform: "YouTube",
      };

      localStorage.setItem(
        `${STORAGE_KEY}:${userId}`,
        JSON.stringify(preferencesToSave),
      );

      setPreferences(preferencesToSave);
      setSaved(true);

      toast.success("Settings saved", {
        description:
          "Your creator profile has been saved on this device.",
      });
    } catch {
      toast.error("Couldn't save settings", {
        description:
          "Browser storage may be unavailable. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      await navigate({ to: "/login", replace: true });
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader
          title="Settings"
          description="Manage your creator profile and account."
        />

        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your settings...
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your creator profile, analysis preferences, and account."
      />

      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight">
                Creator profile
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage the profile associated with your ContentLens account.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Display name" htmlFor="displayName">
              <Input
                id="displayName"
                value={preferences.displayName}
                onChange={(event) =>
                  updateDisplayName(event.target.value)
                }
                placeholder="Your creator name"
                maxLength={80}
              />
            </Field>

            <div className="min-w-0 space-y-2">
              <Label htmlFor="platform">Primary platform</Label>
              <div
                id="platform"
                className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm"
              >
                <span>YouTube</span>
                <span className="ml-auto rounded-full border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  Default
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <p className="text-xs text-muted-foreground">
              Your display name is stored on this device.
            </p>

            <Button
              onClick={() => void saveSettings()}
              disabled={saving || !userId}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              {saving
                ? "Saving..."
                : saved
                  ? "Saved"
                  : "Save changes"}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={<SlidersHorizontal className="h-5 w-5" />}
            title="Analysis preferences"
            description="How ContentLens approaches your analytics."
          />

          <div className="mt-5 divide-y">
            <PreferenceRow
              title="Performance comparison"
              description="Compare content against your channel's baseline."
              value="Channel median"
            />

            <PreferenceRow
              title="Evidence-aware AI"
              description="Separate measured results from hypotheses and experiments."
              value="Enabled"
            />

            <PreferenceRow
              title="Low-sample warnings"
              description="Flag groups with too few posts for reliable conclusions."
              value="Enabled"
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            These preferences describe the current analysis behavior and do
            not independently change the analysis engine.
          </p>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <SectionHeading
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Account"
            description="Manage your signed-in account."
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Signed-in email</p>
              <p className="mt-1 break-all text-sm text-muted-foreground">
                {email || "No email available"}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              {signingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}

              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-dashed p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1">
              <h2 className="font-semibold">Need help?</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Return to your workspace to review your content analytics.
              </p>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>

      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium">
        {value}
      </span>
    </div>
  );
}
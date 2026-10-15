import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { PageHeader, Panel } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_workspace/settings")({
  head: () => ({ meta: [{ title: "Settings — ContentLens" }, { name: "description", content: "Manage your profile and account." }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your creator profile helps ContentLens interpret your data." />
      <div className="max-w-2xl space-y-4">
        <Panel title="Profile" bodyClassName="grid gap-4 sm:grid-cols-2">
          <Field label="Display name"><Input defaultValue="Alex Creator" /></Field>
          <Field label="Niche"><Input defaultValue="AI tools & productivity" /></Field>
          <Field label="Platform">
            <Select defaultValue="YouTube"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["YouTube", "Instagram", "TikTok", "LinkedIn", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
          </Field>
          <Field label="Main goal">
            <Select defaultValue="Grow views"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Grow views", "Increase engagement", "Increase followers", "Generate leads", "Sell products", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
          </Field>
          <div className="sm:col-span-2"><Button disabled title="Saving is available once the backend is connected">Save changes</Button></div>
        </Panel>
        <Panel title="Account">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0"><p className="text-sm">demo@contentlens.app</p><p className="text-xs text-muted-foreground">Free plan</p></div>
            <Button variant="outline" asChild><Link to="/login"><LogOut /> Log out</Link></Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

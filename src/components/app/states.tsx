import type { ReactNode } from "react";
import { Database, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImportCsvDialog } from "./ImportCsvDialog";
import { contentRepo } from "@/lib/content-repository";

export function EmptyContentState({ title = "No content yet", body = "Import a CSV of your posts and their metrics to see your analytics." }: { title?: string; body?: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground"><Upload className="h-5 w-5" /></span>
      <h2 className="mt-4 font-sans text-base font-semibold tracking-normal">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <ImportCsvDialog><Button><Upload /> Import CSV</Button></ImportCsvDialog>
        <Button variant="outline" onClick={() => contentRepo.loadDemo()}><Database /> Explore demo data</Button>
      </div>
    </div>
  );
}

export function AiPlaceholder({ title = "AI analysis not configured yet", children }: { title?: string; children?: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border border-dashed bg-muted/40 p-4">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="text-sm">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{children ?? "This section will be filled by AI analysis once the AI service is connected. Nothing here is generated yet."}</p>
      </div>
    </div>
  );
}

export function InsufficientData({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

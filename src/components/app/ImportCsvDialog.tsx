import { useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Download, FileUp } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildItems, detectMapping, FIELDS, parseCsv, SAMPLE_CSV, type FieldKey, type Mapping } from "@/lib/csv";
import { contentRepo, useContent } from "@/lib/content-repository";
import { PLANS } from "@/config/pricing";

type Step = "upload" | "map" | "preview";
const NONE = "__none";

export function ImportCsvDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [error, setError] = useState("");
  const { source } = useContent();

  const reset = () => { setStep("upload"); setHeaders([]); setRows([]); setMapping({}); setError(""); setFileName(""); };

  async function onFile(f: File | undefined) {
    setError("");
    if (!f) return;
    if (!/\.csv$/i.test(f.name) && f.type !== "text/csv") return setError("Please choose a .csv file.");
    if (f.size > 5 * 1024 * 1024) return setError("File is larger than 5 MB.");
    const parsed = parseCsv(await f.text());
    if (parsed.length < 2) return setError("The file needs a header row and at least one data row.");
    setFileName(f.name);
    setHeaders(parsed[0]!.map((h) => h.trim()));
    setRows(parsed.slice(1));
    setMapping(detectMapping(parsed[0]!));
    setStep("map");
  }

  const result = step === "preview" ? buildItems(rows, mapping) : null;
  const freeLimit = PLANS.free.limits.contentItems;

  function doImport(mode: "replace" | "append") {
    if (!result?.items.length) return;
    contentRepo.importItems(result.items, mode);
    toast.success(`Imported ${result.items.length} item${result.items.length > 1 ? "s" : ""}`, {
      description: result.errors.length ? `${result.errors.length} row(s) skipped.` : "Stored temporarily in this browser.",
    });
    setOpen(false); reset();
  }

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: "contentlens-sample.csv" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import content from CSV</DialogTitle>
          <DialogDescription>
            {step === "upload" && "One row per post. Only a title is required; other metrics are optional."}
            {step === "map" && `${fileName} · ${rows.length} rows. Check the detected column mapping.`}
            {step === "preview" && "Review before importing. Data is kept temporarily in this browser only."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring">
              <FileUp className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Choose a CSV file</span>
              <span className="text-xs text-muted-foreground">Max 5 MB</span>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {error && <p className="flex items-center gap-1.5 text-sm text-destructive"><AlertTriangle className="h-4 w-4" />{error}</p>}
            <p className="text-xs text-muted-foreground">Expected columns: {FIELDS.map((f) => f.key).join(", ")}.</p>
            <Button variant="outline" size="sm" onClick={downloadSample}><Download /> Download sample CSV</Button>
          </div>
        )}

        {step === "map" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
                <span className="text-sm">{f.label}{f.required && <span className="text-destructive"> *</span>}</span>
                <Select value={mapping[f.key] === undefined ? NONE : String(mapping[f.key])}
                  onValueChange={(v) => setMapping((m) => { const n = { ...m }; if (v === NONE) delete n[f.key as FieldKey]; else n[f.key as FieldKey] = Number(v); return n; })}>
                  <SelectTrigger className="h-8 w-40" aria-label={`Column for ${f.label}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not mapped</SelectItem>
                    {headers.map((h, i) => <SelectItem key={i} value={String(i)}>{h || `Column ${i + 1}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        {step === "preview" && result && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" />{result.items.length} valid</span>
              {result.errors.length > 0 && <span className="flex items-center gap-1.5 text-destructive"><AlertTriangle className="h-4 w-4" />{result.errors.length} skipped</span>}
            </div>
            {result.items.length > freeLimit && (
              <p className="rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">The Free plan allows {freeLimit} content items. Limits aren't enforced yet while billing is not connected.</p>
            )}
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead><tr className="border-b text-left text-muted-foreground"><th className="px-3 py-2">Title</th><th className="px-3 py-2">Platform</th><th className="px-3 py-2 text-right">Views</th><th className="px-3 py-2 text-right">Retention</th><th className="px-3 py-2">Posted</th></tr></thead>
                <tbody>{result.items.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b last:border-0"><td className="max-w-48 truncate px-3 py-2">{c.title}</td><td className="px-3 py-2">{c.platform ?? "—"}</td><td className="px-3 py-2 text-right tabular">{c.views ?? "—"}</td><td className="px-3 py-2 text-right tabular">{c.retention ?? "—"}</td><td className="px-3 py-2">{c.postedAt ?? "—"}</td></tr>
                ))}</tbody>
              </table>
            </div>
            {result.errors.length > 0 && (
              <ul className="max-h-32 space-y-0.5 overflow-y-auto rounded-md border bg-muted/40 p-2 font-mono text-xs text-muted-foreground">
                {result.errors.slice(0, 50).map((e, i) => <li key={i}>Row {e.row}: {e.message}</li>)}
              </ul>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "map" && <>
            <Button variant="ghost" onClick={reset}>Back</Button>
            <Button disabled={mapping.title === undefined} onClick={() => setStep("preview")}>Preview import</Button>
          </>}
          {step === "preview" && <>
            <Button variant="ghost" onClick={() => setStep("map")}>Back</Button>
            {source === "imported" && <Button variant="outline" disabled={!result?.items.length} onClick={() => doImport("append")}>Add to existing</Button>}
            <Button disabled={!result?.items.length} onClick={() => doImport("replace")}>{source === "imported" ? "Replace all" : "Import"} {result?.items.length} items</Button>
          </>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

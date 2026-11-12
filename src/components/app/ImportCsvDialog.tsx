import { useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildItems,
  detectMapping,
  FIELDS,
  parseCsv,
  type FieldKey,
  type Mapping,
} from "@/lib/csv";
import { contentRepo, useContent } from "@/lib/content-repository";
import { PLANS, type PlanId } from "@/config/pricing";
import { supabase } from "@/lib/supabase";

type Step = "upload" | "map" | "preview";
const NONE = "__none";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface BillingUsage {
  plan_id: string;
  content_items_used: number;
  content_items_limit: number;
}

export function ImportCsvDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [planId, setPlanId] = useState<PlanId>("free");
  const [planLimit, setPlanLimit] = useState(
    PLANS.free.limits.contentItems,
  );
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");

  const { source, items: existingItems } = useContent();

  const existingCount = existingItems.length;

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      setPlanLoading(true);
      setPlanError("");

      try {
        const { data, error: billingError } = await supabase.rpc(
          "get_my_billing_usage",
        );

        if (billingError) {
          throw billingError;
        }

        const billing = (
          Array.isArray(data) ? data[0] : data
        ) as BillingUsage | null;

        if (!billing) {
          throw new Error("Could not retrieve your current plan.");
        }

        const validPlan = Object.prototype.hasOwnProperty.call(
          PLANS,
          billing.plan_id,
        )
          ? (billing.plan_id as PlanId)
          : "free";

        if (active) {
          setPlanId(validPlan);
          setPlanLimit(
            Number(billing.content_items_limit) ||
              PLANS[validPlan].limits.contentItems,
          );
        }
      } catch (loadError) {
        console.error("Failed to load billing plan:", loadError);

        if (active) {
          setPlanError(
            "We couldn't verify your plan. Please close and reopen this dialog or try again.",
          );
        }
      } finally {
        if (active) {
          setPlanLoading(false);
        }
      }
    }

    void loadPlan();

    return () => {
      active = false;
    };
  }, []);

  function reset() {
    setStep("upload");
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setError("");
    setReading(false);
    setSaving(false);
  }

  async function onFile(file: File | undefined) {
    setError("");
    if (!file) return;

    if (!/\.csv$/i.test(file.name)) {
      setError("Please choose a file with a .csv extension.");
      return;
    }

    if (file.size === 0) {
      setError("This file is empty. Choose a CSV containing your data.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is larger than 5 MB. Please choose a smaller CSV.");
      return;
    }

    setReading(true);

    try {
      const parsed = parseCsv(await file.text());

      if (!parsed || parsed.length < 2) {
        setError("The file needs a header row and at least one data row.");
        return;
      }

      const nextHeaders = parsed[0]?.map((header) => header.trim()) ?? [];

      if (!nextHeaders.some(Boolean)) {
        setError("No column headers were found in this CSV.");
        return;
      }

      const dataRows = parsed
        .slice(1)
        .filter((row) => row.some((cell) => cell.trim() !== ""));

      if (dataRows.length === 0) {
        setError("No non-empty data rows were found in this CSV.");
        return;
      }

      const detectedMapping = detectMapping(nextHeaders);

      setFileName(file.name);
      setHeaders(nextHeaders);
      setRows(dataRows);
      setMapping(detectedMapping);

      if (detectedMapping.title !== undefined) {
        setStep("preview");
      } else {
        setError(
          "We couldn't automatically identify the video title column. Please map it manually.",
        );
        setStep("map");
      }
    } catch {
      setError(
        "We couldn't read this CSV. Check that the file is valid and try again.",
      );
    } finally {
      setReading(false);
    }
  }

  const result = step === "preview" ? buildItems(rows, mapping) : null;

  const incomingCount = result?.items.length ?? 0;
  const appendWouldExceedLimit =
    existingCount + incomingCount > planLimit;
  const replaceWouldExceedLimit = incomingCount > planLimit;

  async function doImport(mode: "replace" | "append") {
    if (saving) return;

    if (planLoading || planError) {
      setError("Please wait until your plan has been verified.");
      return;
    }

    if (!result?.items.length) {
      setError("There are no valid rows to import.");
      return;
    }

    if (mode === "append" && appendWouldExceedLimit) {
      setError(
        `Adding these items would exceed your ${PLANS[planId].name} plan limit of ${planLimit} content items.`,
      );
      return;
    }

    if (mode === "replace" && replaceWouldExceedLimit) {
      setError(
        `This CSV contains ${incomingCount} items, but your ${PLANS[planId].name} plan allows ${planLimit} content items.`,
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await contentRepo.importItems(result.items, mode);

      toast.success(
        `Imported ${result.items.length} item${result.items.length === 1 ? "" : "s"}`,
        {
          description: result.errors.length
            ? `${result.errors.length} row(s) were skipped. The remaining rows were saved.`
            : "Your content was saved to your account.",
        },
      );

      setOpen(false);
      reset();
    } catch (importError) {
      const message =
        importError instanceof Error
          ? importError.message
          : "The import could not be completed. Please try again.";

      setError(message);
      toast.error("Import failed", { description: message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (saving) return;
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import content from CSV</DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload one row per post. A title is required; other metrics are optional."}
            {step === "map" &&
              `${fileName} · ${rows.length} data rows. Check the detected column mapping.`}
            {step === "preview" &&
              "Review your data before importing. Content will be saved to your account."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center hover:bg-muted/50 focus-within:ring-2 focus-within:ring-ring">
              {reading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              ) : (
                <FileUp className="h-6 w-6 text-primary" />
              )}

              <span className="text-sm font-medium">
                {reading ? "Reading CSV..." : "Choose a CSV file"}
              </span>

              <span className="text-xs text-muted-foreground">
                CSV format · Maximum 5 MB
              </span>

              <input
                type="file"
                accept=".csv,text/csv"
                disabled={reading}
                className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  void onFile(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-1.5 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Supported fields: {FIELDS.map((field) => field.key).join(", ")}.
            </p>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Match each ContentLens field to the appropriate CSV column.
              Fields marked * are required.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                >
                  <span className="text-sm">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive"> *</span>
                    )}
                  </span>

                  <Select
                    value={
                      mapping[field.key] === undefined
                        ? NONE
                        : String(mapping[field.key])
                    }
                    onValueChange={(value) => {
                      setMapping((current) => {
                        const next = { ...current };

                        if (value === NONE) {
                          delete next[field.key as FieldKey];
                        } else {
                          next[field.key as FieldKey] = Number(value);
                        }

                        return next;
                      });

                      setError("");
                    }}
                  >
                    <SelectTrigger
                      className="h-8 w-40"
                      aria-label={`Column for ${field.label}`}
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value={NONE}>Not mapped</SelectItem>

                      {headers.map((header, index) => (
                        <SelectItem key={index} value={String(index)}>
                          {header || `Column ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        {step === "preview" && result && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {result.items.length} valid
              </span>

              {result.errors.length > 0 && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {result.errors.length} skipped
                </span>
              )}
            </div>

            <div className="rounded-md border px-3 py-2 text-xs">
              {planLoading ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking your current plan...
                </span>
              ) : planError ? (
                <p role="alert" className="text-destructive">
                  {planError}
                </p>
              ) : (
                <>
                  <p className="font-medium">
                    {PLANS[planId].name} plan
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Existing content: {existingCount} / {planLimit}
                  </p>
                </>
              )}
            </div>

            {!planLoading && !planError && appendWouldExceedLimit && (
              <p className="rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">
                Adding {incomingCount} items would exceed your plan limit.
                You can replace your existing content with a CSV containing
                {` ${planLimit} `}or fewer valid items.
              </p>
            )}

            {!planLoading && !planError && replaceWouldExceedLimit && (
              <p className="rounded-md bg-accent px-3 py-2 text-xs text-accent-foreground">
                This CSV contains {incomingCount} valid items. Your{" "}
                {PLANS[planId].name} plan allows a maximum of {planLimit}.
                Reduce the CSV or upgrade your plan.
              </p>
            )}

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Platform</th>
                    <th className="px-3 py-2 text-right">Views</th>
                    <th className="px-3 py-2 text-right">Retention</th>
                    <th className="px-3 py-2">Posted</th>
                  </tr>
                </thead>

                <tbody>
                  {result.items.slice(0, 5).map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="max-w-48 truncate px-3 py-2">
                        {item.title}
                      </td>
                      <td className="px-3 py-2">{item.platform ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular">
                        {item.views ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular">
                        {item.retention ?? "—"}
                      </td>
                      <td className="px-3 py-2">{item.postedAt ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.items.length > 5 && (
              <p className="text-xs text-muted-foreground">
                Showing the first 5 of {result.items.length} valid rows.
              </p>
            )}

            {result.errors.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium">Skipped rows</p>

                <ul className="max-h-32 space-y-0.5 overflow-y-auto rounded-md border bg-muted/40 p-2 font-mono text-xs text-muted-foreground">
                  {result.errors.slice(0, 50).map((item, index) => (
                    <li key={index}>
                      Row {item.row}: {item.message}
                    </li>
                  ))}
                </ul>

                {result.errors.length > 50 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Showing the first 50 errors.
                  </p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === "map" && (
            <>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setStep("upload");
                  setError("");
                }}
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={
                  reading ||
                  !FIELDS.filter((field) => field.required).every(
                    (field) => mapping[field.key] !== undefined,
                  )
                }
                onClick={() => {
                  setError("");
                  setStep("preview");
                }}
              >
                Preview import
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="ghost"
                type="button"
                disabled={saving}
                onClick={() => {
                  setStep("map");
                  setError("");
                }}
              >
                Back
              </Button>

              <Button
                variant="outline"
                type="button"
                disabled={saving}
                onClick={() => {
                  setStep("map");
                  setError("");
                }}
              >
                Edit column mapping
              </Button>

              {source === "imported" && (
                <Button
                  variant="outline"
                  type="button"
                  disabled={
                    !result?.items.length ||
                    saving ||
                    planLoading ||
                    !!planError ||
                    appendWouldExceedLimit
                  }
                  onClick={() => void doImport("append")}
                >
                  {saving && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add to existing
                </Button>
              )}

              <Button
                type="button"
                disabled={
                  !result?.items.length ||
                  saving ||
                  planLoading ||
                  !!planError ||
                  replaceWouldExceedLimit
                }
                onClick={() => void doImport("replace")}
              >
                {saving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {saving
                  ? "Saving..."
                  : source === "imported"
                    ? "Replace all"
                    : "Import"}{" "}
                {result?.items.length ?? 0} items
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
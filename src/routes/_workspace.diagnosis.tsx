import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  PageHeader,
  Panel,
  Metric,
  EvidenceItem,
} from "@/components/app/primitives";
import { AiPlaceholder, EmptyContentState } from "@/components/app/states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContent } from "@/lib/content-repository";
import {
  analyzeContent,
  type ContentAnalysis,
} from "@/lib/ai";
import {
  byTopic,
  engagementRate,
  fmt,
  fmtDuration,
  median,
  pct,
} from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/diagnosis")({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s["id"] === "string" ? s["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Diagnosis — ContentLens" },
      {
        name: "description",
        content: "Understand why a piece of content performed this way.",
      },
    ],
  }),
  component: Diagnosis,
});

/**
 * Format numbered recommendations so each item starts on a new line.
 * Supports inline text such as "1. First 2. Second 3. Third"
 * and text that already contains line breaks.
 */
function formatAnalysisText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+(?=\d+[.)]\s)/g, "\n")
    .replace(/([.!?;])\s+(?=\d+[.)]\s)/g, "$1\n")
    .replace(/^\s*(\d+[.)])\s*/gm, "$1 ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function Diagnosis() {
  const { id } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { items } = useContent();

  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [analysisFor, setAnalysisFor] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const c = items.find((x) => x.id === id) ?? items[0];

  async function handleAnalyze() {
    if (!c || loading) return;

    setLoading(true);
    setAiError("");
    setAnalysis(null);
    setAnalysisFor(c.id);

    try {
      const result = await analyzeContent({
        title: c.title,
        hook: c.hook,
        platform: c.platform,
        topic: c.topic,
        durationSec: c.durationSec,
        views: c.views,
        likes: c.likes,
        comments: c.comments,
        shares: c.shares,
        saves: c.saves,
        avgWatchSec: c.avgWatchSec,
        retention: c.retention,
        postedAt: c.postedAt,
      });

      setAnalysis(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to analyze this content right now.";

      setAiError(message);
      toast.error("AI analysis failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  const header = (
    <PageHeader
      title="Diagnosis"
      description="Why did this content perform this way — and what should you test next?"
      actions={
        <Button
          onClick={handleAnalyze}
          disabled={!c || loading}
          title={!c ? "Import content first" : "Analyze this content with AI"}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          {loading ? "Analyzing..." : "Analyze Performance"}
        </Button>
      }
    />
  );

  if (!items.length) {
    return (
      <>
        {header}
        <EmptyContentState />
      </>
    );
  }

  const others = items.filter((x) => x.id !== c!.id);

  const medViews = median(
    others.map((x) => x.views).filter((v): v is number => v !== null),
  );

  const medRet = median(
    others.map((x) => x.retention).filter((v): v is number => v !== null),
  );

  const topic = c!.topic
    ? byTopic(items).find((t) => t.key === c!.topic)
    : undefined;

  const eng = engagementRate(c!);

  const split =
    analysis && analysisFor === c!.id ? analysis : null;

  const aiSections = [
    {
      title: "What likely helped",
      content: split?.helped ?? "",
      emptyText: "Analyze this content to identify possible strengths.",
    },
    {
      title: "What likely hurt",
      content: split?.hurt ?? "",
      emptyText: "Analyze this content to identify possible weaknesses.",
    },
    {
      title: "What to test next",
      content: split?.next ?? "",
      emptyText: "Analyze this content to get actionable experiments.",
    },
  ];

  return (
    <>
      {header}

      <Select
        value={c!.id}
        onValueChange={(v) => {
          setAnalysis(null);
          setAnalysisFor("");
          setAiError("");
          void navigate({ search: { id: v } });
        }}
      >
        <SelectTrigger
          className="mb-4 w-full sm:w-96"
          aria-label="Select content"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {items.map((x) => (
            <SelectItem key={x.id} value={x.id}>
              {x.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title={c!.title}
          description={[c!.platform, c!.topic, fmtDuration(c!.durationSec)]
            .filter((x) => x && x !== "—")
            .join(" · ")}
        >
          {c!.hook && (
            <>
              <p className="text-xs text-muted-foreground">Hook</p>
              <p className="mt-1 text-sm">"{c!.hook}"</p>
            </>
          )}

          <div className="-mx-4 mt-4 grid grid-cols-3 divide-x border-t">
            <Metric label="Views" value={fmt(c!.views)} />
            <Metric label="Retention" value={pct(c!.retention)} />
            <Metric
              label="Engage."
              value={pct(eng?.value, 1)}
              hint={
                eng && eng.fieldsUsed < 4
                  ? `${eng.fieldsUsed}/4 fields`
                  : undefined
              }
            />
          </div>
        </Panel>

        <Panel
          title="Performance summary"
          description="Calculated from your data"
          className="lg:col-span-2"
          bodyClassName="py-0"
        >
          {c!.views !== null && medViews !== null && medViews > 0 ? (
            <EvidenceItem kind="observed" meta={`median ${fmt(medViews)}`}>
              This post received{" "}
              <b>{(c!.views / medViews).toFixed(1)}×</b> the median views of
              your other content.
            </EvidenceItem>
          ) : null}

          {c!.retention !== null && medRet !== null ? (
            <EvidenceItem kind="observed" meta={`median ${pct(medRet)}`}>
              Retention was {pct(c!.retention)},{" "}
              {c!.retention >= medRet ? "above" : "below"} the median of your
              other content.
            </EvidenceItem>
          ) : null}

          {topic && !topic.lowSample && topic.lift ? (
            <EvidenceItem kind="pattern" meta={`n=${topic.n}`}>
              {topic.key} posts have {topic.lift.toFixed(1)}× your overall
              median views.
            </EvidenceItem>
          ) : null}

          {(c!.views === null || medViews === null || medViews <= 0) && (
            <p className="py-4 text-sm text-muted-foreground">
              Not enough comparable data to summarise this post yet.
            </p>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {aiSections.map((section) => (
          <Panel key={section.title} title={section.title}>
            {section.content ? (
              <div className="whitespace-pre-line break-words text-sm leading-7">
                {formatAnalysisText(section.content)}
              </div>
            ) : (
              <AiPlaceholder
                title={
                  aiError
                    ? "Analysis unavailable"
                    : loading
                      ? "Analyzing content..."
                      : "AI analysis"
                }
              >
                {aiError
                  ? "Please try Analyze Performance again."
                  : loading
                    ? "ContentLens is reviewing your metrics."
                    : section.emptyText}
              </AiPlaceholder>
            )}
          </Panel>
        ))}
      </div>

      {aiError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-destructive/40 p-4 text-sm text-destructive"
        >
          {aiError}
        </div>
      )}
    </>
  );
}
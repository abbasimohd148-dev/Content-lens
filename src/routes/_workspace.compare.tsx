import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  Panel,
  EvidenceItem,
} from "@/components/app/primitives";
import {
  EmptyContentState,
  InsufficientData,
} from "@/components/app/states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useContent } from "@/lib/content-repository";
import { analyzeContent } from "@/lib/ai";
import {
  engagementRate,
  fmt,
  fmtDuration,
  pct,
  type ContentItem,
} from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/compare")({
  head: () => ({
    meta: [
      { title: "Compare — ContentLens" },
      {
        name: "description",
        content:
          "Compare two videos, understand the available evidence, and decide what to improve.",
      },
    ],
  }),
  component: Compare,
});

const rows: [string, (content: ContentItem) => string][] = [
  ["Views", (content) => fmt(content.views)],
  ["Likes", (content) => fmt(content.likes)],
  ["Comments", (content) => fmt(content.comments)],
  ["Shares", (content) => fmt(content.shares)],
  ["Saves", (content) => fmt(content.saves)],
  ["Retention", (content) => pct(content.retention)],
  ["Engagement", (content) => pct(engagementRate(content)?.value, 1)],
  ["Avg. watch", (content) => fmtDuration(content.avgWatchSec)],
  ["Duration", (content) => fmtDuration(content.durationSec)],
  ["Topic", (content) => content.topic ?? "—"],
  ["Posted at", (content) => content.postedAt ?? "—"],
  ["Hook", (content) => (content.hook ? `"${content.hook}"` : "—")],
];

type AnalysisSection = {
  title: string;
  content: string;
};

function formatNumberedText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(
      /(^|[\n])[ \t]*(\d{1,2})[.)][ \t]*/g,
      "$1$2. ",
    )
    .replace(/[ \t]+(\d{1,2})[.)][ \t]+/g, "\n$1. ")
    .replace(
      /[ \t]*(WHY VIDEO A MAY BE WORKING|WHAT VIDEO B NEEDS TO IMPROVE|WHAT VIDEO B SHOULD IMPROVE|ACTION PLAN FOR VIDEO B):?[ \t]*/gi,
      "\n\n$1\n",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeSections(text: string): AnalysisSection[] {
  const labels = [
    {
      title: "Why Video A may be working",
      pattern: /^WHY VIDEO A MAY BE WORKING:?$/i,
    },
    {
      title: "What Video B needs to improve",
      pattern: /^WHAT VIDEO B (?:NEEDS TO IMPROVE|SHOULD IMPROVE):?$/i,
    },
    {
      title: "Action plan for Video B",
      pattern: /^ACTION PLAN FOR VIDEO B:?$/i,
    },
  ];

  const sections: AnalysisSection[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  const flush = () => {
    const content = currentLines.join("\n").trim();

    if (currentTitle && content) {
      sections.push({ title: currentTitle, content });
    }

    currentLines = [];
  };

  for (const line of formatNumberedText(text).split("\n")) {
    const matched = labels.find((label) =>
      label.pattern.test(line.trim()),
    );

    if (matched) {
      flush();
      currentTitle = matched.title;
    } else {
      if (!currentTitle) currentTitle = "Comparison analysis";
      currentLines.push(line);
    }
  }

  flush();

  if (!sections.length && text.trim()) {
    return [
      {
        title: "Comparison analysis",
        content: formatNumberedText(text),
      },
    ];
  }

  return sections;
}

function getPublicationAge(postedAt: string | null): number | null {
  if (!postedAt) return null;

  const timestamp = Date.parse(postedAt);

  if (Number.isNaN(timestamp)) return null;

  const ageMs = Date.now() - timestamp;

  if (ageMs < 0) return null;

  return Math.max(1, Math.floor(ageMs / 86_400_000));
}

function Compare() {
  const { items } = useContent();

  const [a, setA] = useState<string>();
  const [b, setB] = useState<string>();
  const [analysis, setAnalysis] = useState<AnalysisSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const A = items.find((content) => content.id === a) ?? items[0];

  const B =
    items.find((content) => content.id === b) ??
    items.find((content) => content.id !== A?.id) ??
    items[1];

  function clearAnalysis() {
    setAnalysis([]);
    setAiError("");
  }

  async function handleExplain() {
    if (!A || !B || A.id === B.id || loading) return;

    setLoading(true);
    clearAnalysis();

    try {
      const result = await analyzeContent({
        task: "compare_content",
        instructions: `
Compare Video A and Video B using the actual supplied data.

Return three sections:
WHY VIDEO A MAY BE WORKING
WHAT VIDEO B NEEDS TO IMPROVE
ACTION PLAN FOR VIDEO B

EVIDENCE RULES:
- Treat measured metrics as facts and explanations as hypotheses.
- Never invent missing data or video details.
- Missing values are unknown, not zero.
- Views alone do not establish content quality or explain why a video received more views.
- Average watch time is not retention percentage.
- Watch time above video duration does not prove a precise retention rate or prove why a viewer replayed the video.
- Do not claim a title, brand, hook, topic or algorithm caused a result without evidence.
- Publication dates affect total views. If the videos have different ages, say their total views are not a fair like-for-like comparison.
- Similar watch times do not prove equal retention, satisfaction or engagement.
- Do not suggest adding a brand, object, transformation or visual unless it is supported by the supplied title, hook or topic.
- Do not claim to know impressions, swipe-away rate, traffic sources, audience demographics or editing quality if those details are missing.

SECTION 1:
Explain the most important observed differences first. Then discuss possible explanations, clearly labelled as hypotheses. Mention the main limitations.

SECTION 2:
Identify the most useful improvement to investigate for Video B. Explain why it is worth testing, without claiming an unsupported weakness.

SECTION 3:
Give 3 to 5 numbered actions. Suggest a title or hook only when the supplied information supports it. Identify useful metrics to collect and explain how to compare performance fairly.

FORMATTING:
- Put each numbered point on its own line.
- Use short paragraphs and clear, simple English.
- Separate facts, hypotheses and recommendations.
- If evidence is insufficient to identify the reason, say so honestly and still give the most useful next step.

Return JSON with exactly three non-empty string fields:
helped: Why Video A may be working.
hurt: What Video B needs to improve.
next: Action plan for Video B.
        `.trim(),

        contentA: {
          title: A.title,
          hook: A.hook,
          platform: A.platform,
          topic: A.topic,
          durationSec: A.durationSec,
          views: A.views,
          likes: A.likes,
          comments: A.comments,
          shares: A.shares,
          saves: A.saves,
          avgWatchSec: A.avgWatchSec,
          retention: A.retention,
          postedAt: A.postedAt,
        },

        contentB: {
          title: B.title,
          hook: B.hook,
          platform: B.platform,
          topic: B.topic,
          durationSec: B.durationSec,
          views: B.views,
          likes: B.likes,
          comments: B.comments,
          shares: B.shares,
          saves: B.saves,
          avgWatchSec: B.avgWatchSec,
          retention: B.retention,
          postedAt: B.postedAt,
        },
      });

      const output =
        typeof result === "string"
          ? result
          : [
              result.helped
                ? `WHY VIDEO A MAY BE WORKING\n${result.helped}`
                : "",
              result.hurt
                ? `WHAT VIDEO B NEEDS TO IMPROVE\n${result.hurt}`
                : "",
              result.next
                ? `ACTION PLAN FOR VIDEO B\n${result.next}`
                : "",
            ]
              .filter(Boolean)
              .join("\n\n");

      if (!output.trim()) {
        throw new Error("The AI returned an empty comparison. Please retry.");
      }

      setAnalysis(makeSections(output));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to compare these videos right now.";

      setAiError(message);

      toast.error("Comparison analysis failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  if (items.length < 2) {
    return (
      <>
        <PageHeader
          title="Compare"
          description="Understand why one video may outperform another."
        />

        <EmptyContentState
          title="Need at least two videos"
          body="Import two or more videos to compare their performance."
        />
      </>
    );
  }

  if (!A || !B) return null;

  const differences: string[] = [];

  if (A.views !== null && B.views !== null) {
    if (A.views > B.views) {
      differences.push(
        `Video A has ${fmt(A.views)} views compared with Video B's ${fmt(B.views)}.`,
      );
    } else if (B.views > A.views) {
      differences.push(
        `Video B has ${fmt(B.views)} views compared with Video A's ${fmt(A.views)}.`,
      );
    } else {
      differences.push(`Both videos have ${fmt(A.views)} views.`);
    }
  }

  const ageA = getPublicationAge(A.postedAt);
  const ageB = getPublicationAge(B.postedAt);

  if (ageA !== null && ageB !== null && A.views !== null && B.views !== null) {
    const viewsPerDayA = A.views / ageA;
    const viewsPerDayB = B.views / ageB;

    differences.push(
      `Approximate views per day: Video A ${fmt(Math.round(viewsPerDayA))}; Video B ${fmt(Math.round(viewsPerDayB))}. This is a rough lifetime average, not a measure of current reach or proof of content quality.`,
    );

    if (ageA !== ageB) {
      differences.push(
        `Video A is approximately ${ageA} day(s) old and Video B is approximately ${ageB} day(s) old. Their total views should not be compared as if they had equal time to accumulate views.`,
      );
    }
  }

  const metricComparisons: {
    label: string;
    aValue: number | null;
    bValue: number | null;
    format: (value: number) => string;
  }[] = [
    { label: "Likes", aValue: A.likes, bValue: B.likes, format: fmt },
    { label: "Comments", aValue: A.comments, bValue: B.comments, format: fmt },
    { label: "Shares", aValue: A.shares, bValue: B.shares, format: fmt },
    { label: "Saves", aValue: A.saves, bValue: B.saves, format: fmt },
    {
      label: "Retention",
      aValue: A.retention,
      bValue: B.retention,
      format: pct,
    },
    {
      label: "Average watch time",
      aValue: A.avgWatchSec,
      bValue: B.avgWatchSec,
      format: fmtDuration,
    },
  ];

  for (const metric of metricComparisons) {
    if (metric.aValue === null || metric.bValue === null) continue;

    if (metric.aValue === metric.bValue) {
      differences.push(
        `${metric.label} is equal for both videos (${metric.format(metric.aValue)}).`,
      );
    } else {
      differences.push(
        `${metric.label} is higher for Video ${metric.aValue > metric.bValue ? "A" : "B"} (${metric.format(metric.aValue)} vs ${metric.format(metric.bValue)}).`,
      );
    }
  }

  if (A.durationSec !== null && B.durationSec !== null) {
    differences.push(
      `Duration: Video A is ${fmtDuration(A.durationSec)}; Video B is ${fmtDuration(B.durationSec)}.`,
    );
  }

  const header = (
    <PageHeader
      title="Compare"
      description="Select two videos to compare their measured differences and get evidence-aware suggestions."
      actions={
        <Button
          disabled={!A || !B || A.id === B.id || loading}
          onClick={handleExplain}
          title={
            A.id === B.id
              ? "Select two different videos"
              : "Analyze the differences and improve Video B"
          }
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          {loading ? "Analyzing..." : "Explain & improve"}
        </Button>
      }
    />
  );

  return (
    <>
      {header}

      <Panel bodyClassName="p-0">
        <div className="grid grid-cols-[6rem_1fr_1fr] border-b text-sm sm:grid-cols-[8rem_1fr_1fr]">
          <div className="p-3" />

          {[
            { item: A, label: "A", set: setA },
            { item: B, label: "B", set: setB },
          ].map(({ item, label, set }) => (
            <div key={label} className="min-w-0 border-l p-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Video {label}
              </p>

              <Select
                value={item.id}
                onValueChange={(value) => {
                  set(value);
                  clearAnalysis();
                }}
              >
                <SelectTrigger aria-label={`Video ${label}`}>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {items.map((content) => (
                    <SelectItem
                      key={content.id}
                      value={content.id}
                      disabled={
                        label === "A"
                          ? content.id === B.id
                          : content.id === A.id
                      }
                    >
                      {content.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {rows.map(([label, format]) => (
          <div
            key={label}
            className="grid grid-cols-[6rem_1fr_1fr] border-b text-sm last:border-0 sm:grid-cols-[8rem_1fr_1fr]"
          >
            <div className="p-3 text-xs text-muted-foreground">{label}</div>

            <div className="min-w-0 break-words border-l p-3 tabular">
              {format(A)}
            </div>

            <div className="min-w-0 break-words border-l p-3 tabular">
              {format(B)}
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="Measured differences" className="mt-4" bodyClassName="py-0">
        {differences.length ? (
          differences.map((difference) => (
            <EvidenceItem key={difference} kind="observed">
              {difference}
            </EvidenceItem>
          ))
        ) : (
          <InsufficientData>
            There are not enough shared metrics to identify measured
            differences. Import additional metrics where available.
          </InsufficientData>
        )}
      </Panel>

      {loading && (
        <Panel title="Analyzing your videos" className="mt-4">
          <div className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Comparing available evidence and preparing specific actions for
            Video B...
          </div>
        </Panel>
      )}

      {aiError && (
        <Panel title="Analysis error" className="mt-4">
          <p
            role="alert"
            className="whitespace-pre-wrap text-sm text-destructive"
          >
            {aiError}
          </p>
        </Panel>
      )}

      {analysis.map((section, index) => (
        <Panel
          key={`${section.title}-${index}`}
          title={section.title}
          className="mt-4"
        >
          <div className="space-y-3 text-sm leading-7">
            {section.content
              .split(/\n\s*\n/)
              .map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  className="whitespace-pre-wrap break-words"
                >
                  {paragraph.trim()}
                </p>
              ))}
          </div>
        </Panel>
      ))}

      {!analysis.length && !loading && !aiError && (
        <Panel title="Your video analysis" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Click <strong>Explain &amp; improve</strong> to see what the data
            actually shows, what remains uncertain, and which changes are
            worth testing for Video B.
          </p>
        </Panel>
      )}
    </>
  );
}
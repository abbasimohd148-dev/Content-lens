import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader, Panel } from "@/components/app/primitives";
import {
  EmptyContentState,
  InsufficientData,
} from "@/components/app/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useContent } from "@/lib/content-repository";
import { analyzeContent } from "@/lib/ai";
import {
  byDuration,
  byPlatform,
  byTopic,
  fmt,
  pct,
  MIN_SAMPLE,
  type Group,
} from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/patterns")({
  head: () => ({
    meta: [
      { title: "Winning Patterns — ContentLens" },
      {
        name: "description",
        content:
          "Patterns across your historical content, with sample sizes.",
      },
    ],
  }),
  component: Patterns,
});

function Patterns() {
  const { items } = useContent();

  const [interpretation, setInterpretation] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const topics = byTopic(items);
  const durations = byDuration(items);
  const platforms = byPlatform(items);

  async function handleAnalyzePatterns() {
    if (!items.length || loading) return;

    setLoading(true);
    setInterpretation("");
    setAiError("");

    try {
      const result = await analyzeContent({
        task: "winning_patterns",
        instructions:
          "Interpret the supplied content analytics. Explain which patterns " +
          "are supported by the data and which are too uncertain to trust. " +
          `Groups with fewer than ${MIN_SAMPLE} posts are low-sample groups. ` +
          "Never describe low-sample groups as proven winners. Do not claim " +
          "that a topic, duration, platform, title, or hook caused performance. " +
          "Separate observed facts from hypotheses. Mention missing retention " +
          "or engagement metrics when relevant. Give practical experiments " +
          "based on the available data. Format the answer with clear headings " +
          "and numbered points, each point on a separate line. Do not invent metrics.",
        totalPosts: items.length,
        minimumSampleSize: MIN_SAMPLE,
        topicPatterns: topics.map((group) => ({
          group: group.key,
          medianViews: group.medianViews,
          medianRetention: group.medianRetention,
          averageEngagement: group.avgEngagement,
          lift: group.lift,
          sampleSize: group.n,
          lowSample: group.lowSample,
        })),
        durationPatterns: durations.map((group) => ({
          group: group.key,
          medianViews: group.medianViews,
          medianRetention: group.medianRetention,
          averageEngagement: group.avgEngagement,
          lift: group.lift,
          sampleSize: group.n,
          lowSample: group.lowSample,
        })),
        platformPatterns: platforms.map((group) => ({
          group: group.key,
          medianViews: group.medianViews,
          medianRetention: group.medianRetention,
          averageEngagement: group.avgEngagement,
          lift: group.lift,
          sampleSize: group.n,
          lowSample: group.lowSample,
        })),
      });

      const output =
        typeof result === "string"
          ? result
          : [
              result.helped
                ? `Patterns supported by the data:\n${result.helped}`
                : "",
              result.hurt
                ? `Limitations and uncertainties:\n${result.hurt}`
                : "",
              result.next
                ? `Experiments to try next:\n${result.next}`
                : "",
            ]
              .filter(Boolean)
              .join("\n\n");

      if (!output.trim()) {
        throw new Error("The AI returned an empty interpretation.");
      }

      setInterpretation(output);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to analyze patterns right now.";

      setAiError(message);

      toast.error("Pattern analysis failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  const header = (
    <PageHeader
      title="Winning Patterns"
      description={`What tends to work for your audience. Groups under ${MIN_SAMPLE} posts are flagged as low sample.`}
      actions={
        <Button
          onClick={handleAnalyzePatterns}
          disabled={!items.length || loading}
          title="Interpret your content analytics with AI"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          {loading ? "Analyzing..." : "Analyze Patterns"}
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

  return (
    <>
      {header}

      {/* Stack each section vertically, using the full available width. */}
      <div className="flex w-full flex-col gap-4">
        <GroupTable title="By topic" groups={topics} />

        <GroupTable title="By duration" groups={durations} />

        <GroupTable title="By platform" groups={platforms} />

        <Panel title="Interpretation">
          {loading ? (
            <div className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              ContentLens is reviewing your patterns and sample sizes...
            </div>
          ) : aiError ? (
            <div
              role="alert"
              className="whitespace-pre-wrap break-words text-sm leading-relaxed text-destructive"
            >
              {aiError}
            </div>
          ) : interpretation ? (
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {interpretation}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Generate an AI interpretation of your topic, duration, and
                platform results. ContentLens will distinguish measured
                patterns from uncertain hypotheses.
              </p>
              <p className="text-xs text-muted-foreground">
                Results with small sample sizes are not reliable evidence of
                a repeatable winning pattern.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function GroupTable({
  title,
  groups,
}: {
  title: string;
  groups: Group[];
}) {
  return (
    <Panel title={title} bodyClassName="p-0">
      {!groups.length ? (
        <InsufficientData>No data for this dimension.</InsufficientData>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Group</th>
                <th className="px-4 py-2 text-right font-medium">
                  Median views
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  Retention
                </th>
                <th className="px-4 py-2 text-right font-medium">
                  Engage.
                </th>
                <th className="px-4 py-2 text-right font-medium">Lift</th>
                <th className="px-4 py-2 text-right font-medium">n</th>
              </tr>
            </thead>

            <tbody>
              {groups.map((group) => (
                <tr key={group.key} className="border-b last:border-0">
                  <td className="px-4 py-2.5">
                    {group.key}
                    {group.lowSample && (
                      <Badge
                        variant="outline"
                        className="ml-1 text-[10px] text-muted-foreground"
                      >
                        low sample
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular">
                    {fmt(group.medianViews)}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular">
                    {pct(group.medianRetention)}
                  </td>

                  <td className="px-4 py-2.5 text-right tabular">
                    {pct(group.avgEngagement, 1)}
                  </td>

                  <td
                    className={`px-4 py-2.5 text-right tabular ${
                      group.lift !== null && group.lift >= 1
                        ? "text-success"
                        : "text-muted-foreground"
                    }`}
                  >
                    {group.lift === null
                      ? "—"
                      : `${group.lift.toFixed(1)}×`}
                  </td>

                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                    {group.n}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
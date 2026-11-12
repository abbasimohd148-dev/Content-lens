import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Loader2, Lightbulb, Target, FlaskConical } from "lucide-react";
import { toast } from "sonner";

import {
  PageHeader,
  Panel,
  EvidenceItem,
  EvidenceTag,
} from "@/components/app/primitives";
import {
  AiPlaceholder,
  EmptyContentState,
  InsufficientData,
} from "@/components/app/states";
import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/content-repository";
import { analyzeContent } from "@/lib/ai";
import {
  byDuration,
  byPlatform,
  byTopic,
  pct,
  MIN_SAMPLE,
} from "@/lib/analytics";

export const Route = createFileRoute("/_workspace/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations — ContentLens" },
      {
        name: "description",
        content: "What should you create next, grounded in your data.",
      },
    ],
  }),
  component: Recs,
});

function Recs() {
  const { items } = useContent();

  const [ideas, setIdeas] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const topics = byTopic(items);
  const durations = byDuration(items);
  const platforms = byPlatform(items);

  const reliable = <T extends { lowSample: boolean }>(groups: T[]) =>
    groups.filter((group) => !group.lowSample);

  const reliableTopics = reliable(topics);
  const reliableDurations = reliable(durations);
  const reliablePlatforms = reliable(platforms);

  const topic = [...reliableTopics].sort(
    (a, b) => (b.lift ?? -1) - (a.lift ?? -1),
  )[0];

  const dur = [...reliableDurations]
    .filter((group) => group.medianRetention !== null)
    .sort(
      (a, b) =>
        (b.medianRetention ?? -1) - (a.medianRetention ?? -1),
    )[0];

  const plat = [...reliablePlatforms].sort(
    (a, b) => (b.lift ?? -1) - (a.lift ?? -1),
  )[0];

  async function handleGenerateIdeas() {
    if (!items.length || loading) return;

    setLoading(true);
    setIdeas("");
    setAiError("");

    try {
      const result = await analyzeContent({
        task: "content_recommendations",
        instructions:
          "You are ContentLens, a careful content strategy analyst. Generate " +
          "3 practical content ideas using only the supplied creator analytics. " +
          "For each idea provide: (1) idea/title, (2) suggested opening hook, " +
          "(3) format or topic to test, (4) suggested duration only if the " +
          "data supports one, (5) supporting evidence, (6) confidence level, " +
          "and (7) the metric to track. Distinguish observed facts from " +
          "data-supported patterns and hypotheses. Groups with fewer than " +
          `${MIN_SAMPLE} posts are low-sample and must not be presented as ` +
          "proven winners. Never claim correlation proves causation. Do not " +
          "invent metrics, retention, engagement, or audience preferences. " +
          "If data is insufficient, say so and suggest a small experiment to " +
          "collect useful evidence. Make ideas specific and varied. Use clear " +
          "headings and numbered lists, with each numbered item on a new line.",
        totalPosts: items.length,
        minimumSampleSize: MIN_SAMPLE,
        content: items.map((item) => ({
          title: item.title,
          hook: item.hook,
          platform: item.platform,
          topic: item.topic,
          durationSec: item.durationSec,
          views: item.views,
          likes: item.likes,
          comments: item.comments,
          shares: item.shares,
          saves: item.saves,
          avgWatchSec: item.avgWatchSec,
          retention: item.retention,
          postedAt: item.postedAt,
        })),
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
                ? `Content ideas and supporting evidence:\n${result.helped}`
                : "",
              result.hurt
                ? `Limitations and confidence:\n${result.hurt}`
                : "",
              result.next
                ? `Experiments and metrics to track:\n${result.next}`
                : "",
            ]
              .filter(Boolean)
              .join("\n\n");

      if (!output.trim()) {
        throw new Error("The AI returned empty recommendations.");
      }

      setIdeas(output);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate recommendations right now.";

      setAiError(message);

      toast.error("Recommendation generation failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  const header = (
    <PageHeader
      title="What should I create next?"
      description="Ideas grounded in your own history. Suggestions to test — never guarantees."
      actions={
        <Button
          onClick={handleGenerateIdeas}
          disabled={!items.length || loading}
          title="Generate recommendations from your imported analytics"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          {loading ? "Generating..." : "Generate ideas"}
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

      <Panel
        title="Starting points from your data"
        description="Calculated from your imported posts, not AI-generated."
        bodyClassName="py-0"
      >
        {topic?.lift !== null && topic?.lift !== undefined ? (
          <EvidenceItem kind="pattern" meta={`n=${topic.n}`}>
            Topic to investigate: <b>{topic.key}</b> has a median-view lift
            of <b>{topic.lift.toFixed(1)}×</b> against the overall baseline.
            This is a pattern to investigate, not proof that the topic caused
            higher views.
          </EvidenceItem>
        ) : null}

        {dur?.medianRetention != null ? (
          <EvidenceItem kind="pattern" meta={`n=${dur.n}`}>
            Length group with the highest median retention among reliable
            groups: <b>{dur.key}</b> ({pct(dur.medianRetention)} median
            retention).
          </EvidenceItem>
        ) : null}

        {plat?.lift !== null && plat?.lift !== undefined ? (
          <EvidenceItem kind="pattern" meta={`n=${plat.n}`}>
            Platform to investigate: <b>{plat.key}</b> has a median-view lift
            of <b>{plat.lift.toFixed(1)}×</b>. Compare similar posts before
            treating this as a repeatable result.
          </EvidenceItem>
        ) : null}

        {!topic && !dur && !plat ? (
          <InsufficientData>
            Not enough posts per group for reliable starting points yet.
            Generate ideas to get cautious experiments based on the available
            data.
          </InsufficientData>
        ) : null}
      </Panel>

      <div className="mt-6">
        <Panel
          title="Content ideas"
          description="AI-generated experiments based on your imported content and calculated patterns."
          action={
            <span className="hidden sm:inline-flex">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </span>
          }
        >
          {loading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              ContentLens is reviewing your content history and preparing
              experiments...
            </div>
          ) : aiError ? (
            <div className="space-y-3">
              <p
                role="alert"
                className="whitespace-pre-wrap break-words text-sm leading-relaxed text-destructive"
              >
                {aiError}
              </p>
              <Button variant="outline" onClick={handleGenerateIdeas}>
                <Sparkles /> Try again
              </Button>
            </div>
          ) : ideas ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <EvidenceTag kind="observed" />
                <EvidenceTag kind="pattern" />
                <EvidenceTag kind="hypothesis" />
              </div>

              <div className="whitespace-pre-wrap break-words text-sm leading-7">
                {ideas}
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleGenerateIdeas}
                  disabled={loading}
                >
                  <Sparkles /> Generate new ideas
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AiPlaceholder title="Ready to generate recommendations">
                ContentLens will suggest three content experiments, including
                opening hooks, supporting evidence, confidence levels, and
                metrics to track. Recommendations are hypotheses to test, not
                guaranteed outcomes.
              </AiPlaceholder>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex gap-3 rounded-md border p-3">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Based on your data
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Uses imported posts and calculated topic, duration, and
                      platform patterns.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-md border p-3">
                  <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Designed as experiments
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Each idea should have a measurable result to track after
                      publishing.
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleGenerateIdeas} disabled={loading}>
                <Sparkles /> Generate 3 content ideas
              </Button>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
import { supabase } from "@/lib/supabase";

export interface ContentAnalysis {
  helped: string;
  hurt: string;
  next: string;
}

export async function analyzeContent(
  content: Record<string, unknown>,
): Promise<ContentAnalysis> {
  const { data, error } = await supabase.functions.invoke(
    "contentlens-ai",
    {
      body: { content },
    },
  );

  if (error) {
    let message =
      error.message || "Failed to connect to the AI service.";

    try {
      const context = error.context;

      if (context instanceof Response) {
        const responseData = await context.clone().json();

        if (
          typeof responseData?.error === "string" &&
          responseData.error.trim()
        ) {
          message = responseData.error;
        }
      }
    } catch {
      // Keep the original error message if response details are unavailable.
    }

    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const analysis = data?.analysis;

  if (
    !analysis ||
    typeof analysis.helped !== "string" ||
    typeof analysis.hurt !== "string" ||
    typeof analysis.next !== "string"
  ) {
    throw new Error(
      "The AI service returned an invalid analysis format.",
    );
  }

  return analysis as ContentAnalysis;
}
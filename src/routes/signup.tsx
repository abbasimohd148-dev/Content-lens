import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ContentLens" },
      { name: "description", content: "Create a ContentLens account and find out what content works for your audience." },
      { property: "og:title", content: "Sign up — ContentLens" },
      { property: "og:description", content: "Start analyzing your content performance with ContentLens." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthCard mode="signup" />,
});

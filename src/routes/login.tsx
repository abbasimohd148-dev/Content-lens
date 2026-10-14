import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/AuthCard";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — ContentLens" },
      { name: "description", content: "Log in to ContentLens to see your content performance insights." },
      { property: "og:title", content: "Log in — ContentLens" },
      { property: "og:description", content: "Access your ContentLens dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ContentLens" },
      {
        name: "description",
        content:
          "Read the terms and conditions governing your use of ContentLens.",
      },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="mx-auto max-w-4xl px-6 py-16">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Home
        </Link>

        <h1 className="mt-6 font-display text-3xl font-bold text-foreground">
          Terms of Service
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Effective date: November 12, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">
              1. About ContentLens
            </h2>
            <p>
              ContentLens is a software-as-a-service platform that helps
              creators understand their YouTube content performance through
              analytics, comparisons, performance patterns and AI-assisted
              recommendations.
            </p>
            <p className="mt-2">
              These Terms of Service govern your access to and use of the
              ContentLens website and services. By creating an account or
              using the service, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Account Registration and Security
            </h2>
            <p>
              You must provide accurate and current information when
              registering for an account. You are responsible for maintaining
              the confidentiality of your login credentials and for
              activities carried out through your account.
            </p>
            <p className="mt-2">
              Please notify us promptly if you believe your account has
              been accessed without your authorization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              3. Subscription Plans and Payments
            </h2>
            <p>
              ContentLens offers Free, Pro and Business subscription plans.
              The currently advertised monthly prices are:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Free: $0 per month.</li>
              <li>Pro: $19 per month.</li>
              <li>Business: $49 per month.</li>
            </ul>
            <p className="mt-2">
              Paid subscriptions are billed monthly. Applicable taxes,
              billing terms and the total amount payable will be shown
              during checkout before you confirm a purchase.
            </p>
            <p className="mt-2">
              Paid features are made available after payment confirmation.
              Subscription renewal and cancellation are governed by the
              terms presented during checkout and our Refund and
              Cancellation Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              4. Acceptable Use
            </h2>
            <p>
              You agree to use ContentLens lawfully and responsibly.
              You must not:
            </p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Use the service for unlawful or fraudulent activities.</li>
              <li>Attempt unauthorized access to accounts or systems.</li>
              <li>Interfere with the security or operation of the platform.</li>
              <li>Upload or submit data that you do not have permission to use.</li>
              <li>Attempt to disrupt, reverse engineer or abuse the service.</li>
              <li>Use the platform in a way that harms other users or third parties.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              5. AI-Generated Insights and Disclaimers
            </h2>
            <p>
              ContentLens uses AI-assisted technology to generate
              analysis, comparisons and recommendations based on
              information provided by users.
            </p>
            <p className="mt-2">
              AI-generated results may be incomplete, inaccurate or
              unsuitable for a particular purpose. They are provided
              for informational purposes and should be reviewed
              independently before being relied upon.
            </p>
            <p className="mt-2">
              ContentLens does not guarantee views, engagement,
              subscribers, revenue, channel growth or any particular
              content performance outcome.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              6. User Content and Data
            </h2>
            <p>
              You retain ownership of the content and data you submit
              to ContentLens. You are responsible for ensuring that
              you have the necessary rights and permissions to
              provide that information.
            </p>
            <p className="mt-2">
              You grant ContentLens permission to process submitted
              information as reasonably necessary to operate the
              service and provide its features.
            </p>
            <p className="mt-2">
              Our collection and handling of personal information
              are explained in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Third-Party Services
            </h2>
            <p>
              ContentLens may rely on third-party providers for
              authentication, hosting, database services, AI
              processing and payment processing.
            </p>
            <p className="mt-2">
              Your use of third-party services may also be subject
              to their respective terms and privacy policies.
              ContentLens is not responsible for independent
              third-party services outside its control.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              8. Service Availability and Termination
            </h2>
            <p>
              We aim to provide a reliable service but do not
              guarantee uninterrupted or error-free availability.
              Features may occasionally be updated, modified or
              temporarily unavailable for maintenance or other reasons.
            </p>
            <p className="mt-2">
              We may suspend or restrict access where reasonably
              necessary to protect the platform, comply with legal
              obligations or address violations of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              9. Limitation of Liability
            </h2>
            <p>
              To the extent permitted by applicable law, ContentLens
              is not liable for indirect, incidental or consequential
              losses arising from the use of, or inability to use,
              the service.
            </p>
            <p className="mt-2">
              Nothing in these terms excludes or limits liability
              where such exclusion or limitation is prohibited
              by applicable law, including rights that cannot
              legally be waived.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              10. Changes to These Terms
            </h2>
            <p>
              We may update these Terms of Service when our services,
              business practices or legal requirements change.
              Updated terms will be published on this page with
              a revised effective date.
            </p>
            <p className="mt-2">
              Continued use of ContentLens after updated terms
              become effective is subject to applicable law and
              any required notice or consent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              11. Contact Us
            </h2>
            <p>
              If you have questions about these Terms of Service,
              your account or the ContentLens platform, please
              contact our support team:
            </p>

            <p className="mt-3">
              <span className="font-semibold text-foreground">
                ContentLens Support
              </span>
              <br />
              Email:{" "}
              <a
                href="mailto:founder@aicostpilot.site"
                className="font-medium text-primary underline underline-offset-4"
              >
                founder@aicostpilot.site
              </a>
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
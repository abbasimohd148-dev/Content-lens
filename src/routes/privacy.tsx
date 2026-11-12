import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            ← Back to Home
          </a>
        </p>

        <h1 className="mt-5 font-display text-3xl font-bold text-foreground">
          Privacy Policy
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Effective date: November 12, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Introduction
          </h2>
          <p>
            Welcome to ContentLens. We respect your privacy and are committed
            to handling your information responsibly. This Privacy Policy
            explains what information we collect, how we use it, how it may
            be shared, and the choices available to you when using our
            website and services.
          </p>
          <p className="mt-2">
            By using ContentLens, you acknowledge that your information
            may be handled as described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Information We Collect
          </h2>
          <p>
            Depending on how you use ContentLens, we may collect the
            following categories of information:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>
              <span className="font-medium text-foreground">
                Account information:
              </span>{" "}
              Your name, email address and account-related information.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Content and performance data:
              </span>{" "}
              YouTube content information, metrics and other data you
              choose to import or submit.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Usage information:
              </span>{" "}
              Information about your interactions with ContentLens and
              the features you use.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Subscription information:
              </span>{" "}
              Your selected plan, subscription status and usage records.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Technical information:
              </span>{" "}
              Certain browser, device and diagnostic information associated
              with your use of the service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. How We Use Your Information
          </h2>
          <p>
            We use the information we collect for purposes including:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Creating, maintaining and securing user accounts.</li>
            <li>Providing and operating ContentLens features.</li>
            <li>Analyzing imported content and identifying performance patterns.</li>
            <li>Generating AI-assisted insights and recommendations.</li>
            <li>Managing subscriptions, billing status and usage limits.</li>
            <li>Diagnosing technical issues and improving service reliability.</li>
            <li>Responding to questions, support requests and user feedback.</li>
            <li>Meeting applicable legal and regulatory obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. AI Processing
          </h2>
          <p>
            Certain ContentLens features use artificial intelligence to
            analyze information you provide and generate insights,
            comparisons and recommendations.
          </p>
          <p className="mt-2">
            To provide these features, relevant information may be sent
            to third-party AI service providers for processing. Such
            processing is subject to the providers' applicable terms
            and privacy practices.
          </p>
          <p className="mt-2">
            AI-generated results may be incomplete or inaccurate and
            should be reviewed before being used to make decisions.
            Please avoid submitting sensitive personal information
            that is not necessary to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Third-Party Services
          </h2>
          <p>
            ContentLens uses third-party service providers to support
            its operations. These may include providers for:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>User authentication and account management.</li>
            <li>Database hosting and data storage.</li>
            <li>AI processing and related services.</li>
            <li>Payment processing and subscription management.</li>
            <li>Website hosting and infrastructure.</li>
          </ul>
          <p className="mt-2">
            These providers may process information on our behalf
            as necessary to deliver their services. Their own terms
            and privacy policies may also apply.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Payments and Billing Information
          </h2>
          <p>
            Payments and subscriptions may be processed by third-party
            payment providers. When you make a purchase, the payment
            provider handles payment information in accordance with
            its own security and privacy practices.
          </p>
          <p className="mt-2">
            ContentLens does not intend to store complete payment
            card details on its application servers. We may receive
            and store limited transaction or subscription information
            needed to manage your account and paid features.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. Data Security
          </h2>
          <p>
            We use reasonable technical and organizational measures
            designed to protect information against unauthorized
            access, alteration, loss, misuse or disclosure.
          </p>
          <p className="mt-2">
            However, no method of electronic storage or internet
            transmission is completely secure. We cannot guarantee
            absolute security of information transmitted to or
            stored by an online service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Data Retention
          </h2>
          <p>
            We retain information for as long as reasonably necessary
            to provide our services, maintain user accounts, administer
            subscriptions, resolve disputes and meet applicable legal
            obligations.
          </p>
          <p className="mt-2">
            Retention periods may vary depending on the type of
            information and the purpose for which it was collected.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Your Privacy Rights
          </h2>
          <p>
            Depending on your location and applicable data protection
            laws, you may have rights to:
          </p>
          <ul className="ml-6 list-disc space-y-1">
            <li>Request access to personal information we hold about you.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of your personal information.</li>
            <li>Request a copy of certain information you provided.</li>
            <li>Raise questions or concerns about how your information is processed.</li>
          </ul>
          <p className="mt-2">
            To exercise an applicable privacy right, contact us using
            the email address in the Contact Us section. We may need
            to verify your identity before responding.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            10. Changes to This Privacy Policy
          </h2>
          <p>
            We may revise this Privacy Policy from time to time to
            reflect changes to our services, practices or legal
            requirements. Updates will be published on this page
            with a revised effective date.
          </p>
            <p className="mt-2">
            We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            11. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, wish to
            make a privacy request or have concerns about how your
            information is handled, please contact us:
          </p>
          <p className="mt-3">
            <span className="font-semibold text-foreground">
              ContentLens Privacy and Support
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
  );
}
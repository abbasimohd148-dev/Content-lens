import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">
            ← Back to Home
          </a>
        </p>

        <h1 className="mt-5 font-display text-3xl font-bold text-foreground">
          Refund and Cancellation Policy
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          Effective date: November 12, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">
            1. Overview
          </h2>
          <p>
            This Refund and Cancellation Policy explains how subscriptions,
            cancellations, payment issues and refund requests are handled
            by ContentLens. By subscribing to a paid plan, you acknowledge
            and agree to the terms described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            2. Subscription Plans and Billing
          </h2>
          <ul className="ml-6 list-disc space-y-1">
            <li>Free Plan: $0 per month.</li>
            <li>Pro Plan: $19 per month.</li>
            <li>Business Plan: $49 per month.</li>
          </ul>
          <p className="mt-2">
            Paid subscriptions are billed monthly unless otherwise stated
            during checkout. Subscription prices, applicable taxes and
            payment terms will be displayed before you complete your purchase.
            Your subscription may renew automatically until cancelled.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            3. Subscription Cancellation
          </h2>
          <p>
            You may request cancellation of your paid subscription at any
            time. Once cancellation is confirmed, future subscription
            renewals will be stopped.
          </p>
          <p className="mt-2">
            Depending on your subscription terms, access to paid features
            may continue until the end of your current billing period.
            Cancelling a subscription does not automatically refund
            payments already made.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            4. Refund Eligibility
          </h2>
          <p>
            Subscription payments are generally non-refundable after a
            billing period has started, except where required by applicable
            law or where ContentLens approves a refund.
          </p>
          <p className="mt-2">
            Each refund request is reviewed individually. If you believe
            you were charged incorrectly or experienced a billing issue,
            contact us with your account email, payment date and relevant
            transaction details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            5. Duplicate or Incorrect Payments
          </h2>
          <p>
            If you believe you have been charged more than once for the
            same subscription or have received an incorrect charge,
            please contact our support team. Verified duplicate or
            incorrect payments will be reviewed and corrected where
            appropriate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            6. Failed Payments
          </h2>
          <p>
            If a subscription payment fails, access to paid features
            may be restricted or suspended until the payment issue
            is resolved. Payment retries, where applicable, are handled
            according to the payment provider's billing process.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            7. How to Request a Refund
          </h2>
          <p>
            To request a refund or report a billing issue, email our
            support team at the address listed below. Please include
            your ContentLens account email, payment date and a description
            of the issue.
          </p>
          <p className="mt-2">
            For your security, never include your complete payment card
            number, CVV or other sensitive payment credentials in your
            support request.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            8. Refund Processing
          </h2>
          <p>
            If a refund is approved, it will generally be processed
            through the original payment method where possible.
            The time required for the funds to appear in your account
            depends on the payment provider and your financial
            institution.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            9. Changes to This Policy
          </h2>
          <p>
            ContentLens may update this policy from time to time.
            Any changes will be published on this page with an
            updated effective date. We encourage you to review
            this policy periodically.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">
            10. Contact Us
          </h2>
          <p>
            For refund requests, subscription cancellations or
            billing-related questions, please contact our support team:
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
  );
}
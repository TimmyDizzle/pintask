import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";

export default function PrivacyPage() {
  useDocumentTitle("Privacy Policy — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-center">
            Privacy Policy
          </h1>
          <p className="mt-4 text-center text-sm text-muted-foreground">Last updated: March 24, 2026</p>

          <div className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">1. Information We Collect</h2>
              <p className="mt-2">When you create an account, we collect your email address and any profile information you choose to provide. We also collect usage data such as task activity and feature usage to improve the service.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
              <p className="mt-2">We use your information to provide and improve the Pintask service, send important account notifications, and respond to support requests. We do not sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
              <p className="mt-2">Your data is encrypted at rest and in transit. We use industry-standard security practices to protect your information. Your task data is stored securely and is only accessible to you.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">4. Cookies</h2>
              <p className="mt-2">We use essential cookies for authentication and session management. We do not use third-party tracking cookies or advertising cookies.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">5. Your Rights</h2>
              <p className="mt-2">You can export or delete your data at any time. You can also request a copy of all personal information we hold about you by contacting us.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">6. Contact</h2>
              <p className="mt-2">If you have questions about this policy, please contact us at privacy@pintask.online.</p>
            </section>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

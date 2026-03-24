import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";

export default function TermsPage() {
  useDocumentTitle("Terms of Service — Pintask");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-center">
            Terms of Service
          </h1>
          <p className="mt-4 text-center text-sm text-muted-foreground">Last updated: March 24, 2026</p>

          <div className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="mt-2">By accessing or using Pintask, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">2. Description of Service</h2>
              <p className="mt-2">Pintask is a web-based task management application that provides Kanban boards, time tracking, and productivity tools. The service is provided "as is" and may be updated from time to time.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">3. User Accounts</h2>
              <p className="mt-2">You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account and keep your information up to date.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">4. Acceptable Use</h2>
              <p className="mt-2">You agree not to use the service for any unlawful purpose or in violation of these terms. You may not attempt to gain unauthorized access to any part of the service.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">5. Data Ownership</h2>
              <p className="mt-2">You retain ownership of all content and data you create within Pintask. We do not claim intellectual property rights over your task data, projects, or other content.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">6. Service Availability</h2>
              <p className="mt-2">We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
              <p className="mt-2">Pintask is provided without warranty of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from use of the service.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">8. Changes to Terms</h2>
              <p className="mt-2">We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold text-foreground">9. Contact</h2>
              <p className="mt-2">For questions about these terms, contact us at legal@pintask.online.</p>
            </section>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

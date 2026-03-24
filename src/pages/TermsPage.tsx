import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";

export default function TermsPage() {
  useDocumentTitle("Terms of Service — Pintask");

  const sections = [
    { title: "1. Acceptance of Terms", text: "By accessing or using Pintask, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service." },
    { title: "2. Description of Service", text: "Pintask is a web-based task management application that provides Kanban boards, time tracking, and productivity tools. The service is provided \"as is\" and may be updated from time to time." },
    { title: "3. User Accounts", text: "You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account and keep your information up to date." },
    { title: "4. Acceptable Use", text: "You agree not to use the service for any unlawful purpose or in violation of these terms. You may not attempt to gain unauthorized access to any part of the service." },
    { title: "5. Data Ownership", text: "You retain ownership of all content and data you create within Pintask. We do not claim intellectual property rights over your task data, projects, or other content." },
    { title: "6. Service Availability", text: "We strive to maintain high availability but do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability." },
    { title: "7. Limitation of Liability", text: "Pintask is provided without warranty of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from use of the service." },
    { title: "8. Changes to Terms", text: "We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the updated terms." },
    { title: "9. Contact", text: "For questions about these terms, contact us at legal@pintask.online." },
  ];

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">Terms of Service</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: March 24, 2026</p>
          </RevealSection>

          <div className="mt-12 space-y-8">
            {sections.map((s, i) => (
              <RevealSection key={s.title} delay={80 + i * 50}>
                <h2 className="font-heading text-lg font-semibold text-foreground">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";

export default function PrivacyPage() {
  useDocumentTitle("Privacy Policy — Pintask");

  const sections = [
    { title: "1. Information We Collect", text: "When you create an account, we collect your email address and any profile information you choose to provide. We also collect usage data such as task activity and feature usage to improve the service." },
    { title: "2. How We Use Your Information", text: "We use your information to provide and improve the Pintask service, send important account notifications, and respond to support requests. We do not sell your data to third parties." },
    { title: "3. Data Storage & Security", text: "Your data is encrypted at rest and in transit. We use industry-standard security practices to protect your information. Your task data is stored securely and is only accessible to you." },
    { title: "4. Cookies", text: "We use essential cookies for authentication and session management. We do not use third-party tracking cookies or advertising cookies." },
    { title: "5. Your Rights", text: "You can export or delete your data at any time. You can also request a copy of all personal information we hold about you by contacting us." },
    { title: "6. Contact", text: "If you have questions about this policy, please contact us at privacy@pintask.online." },
  ];

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: March 24, 2026</p>
          </RevealSection>

          <div className="mt-12 space-y-8">
            {sections.map((s, i) => (
              <RevealSection key={s.title} delay={80 + i * 60}>
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

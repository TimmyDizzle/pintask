import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";

const sections = [
  { title: "1. Acceptance of Terms", text: "By creating an account or using Pintask, you agree to be bound by these Terms. If you do not agree, do not use the service." },
  { title: "2. Your Account", text: "You must be 13 years or older to use Pintask. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized account access." },
  { title: "3. Acceptable Use", text: "You agree NOT to use Pintask to: upload or transmit malicious code, viruses, or harmful content; harass, threaten, or harm other users; violate any applicable law or regulation; infringe on the intellectual property rights of others; attempt to access other users' accounts or data; scrape, crawl, or automated-access the platform without written permission; or use the platform to send unsolicited communications (spam)." },
  { title: "4. Your Content", text: "You own the content you create in Pintask. By using the service, you grant us a limited license to store, process, and display your content solely to provide the service to you. We do not claim ownership of your data. You can export it at any time." },
  { title: "5. Extensions", text: "Free Extensions are available under the terms specified by their creator. Paid Extensions are billed monthly — cancel anytime. No refunds for partial months unless required by applicable law. Custom Extensions: you retain full ownership of extensions you build. By publishing to the store, you grant Pintask a license to distribute it under the terms you set. Spire Club: contributions are non-refundable once an extension enters active development. All backers receive lifelong access upon shipping." },
  { title: "6. Service Availability", text: "We strive for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance when possible. We are not liable for losses caused by service interruptions beyond our reasonable control." },
  { title: "7. Termination", text: "You may delete your account at any time. We may suspend or terminate accounts that violate these Terms, with notice where reasonably possible. Upon termination, your right to use the service ends immediately. You may export your data before terminating." },
  { title: "8. Limitation of Liability", text: "To the maximum extent permitted by law, Pintask is not liable for indirect, incidental, special, or consequential damages. Our total liability to you shall not exceed the amount you paid us in the 12 months preceding the claim." },
  { title: "9. Changes to Terms", text: "We will notify registered users of material changes to these Terms by email at least 14 days before they take effect. Continued use after the effective date constitutes acceptance." },
  { title: "10. Contact", text: "Terms questions: legal@pintask.online. General: hello@pintask.online" },
];

export default function TermsPage() {
  useDocumentTitle("Terms of Service — Pintask", "Pintask's Terms of Service. Your rights, our responsibilities, and the rules that keep the platform fair for everyone.");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">Terms of Service</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: March 24, 2026</p>
          </RevealSection>
          <RevealSection delay={50}>
            <p className="mt-8 text-sm text-muted-foreground leading-relaxed">By using Pintask at pintask.online, you agree to these Terms of Service. Please read them carefully.</p>
          </RevealSection>
          <div className="mt-10 space-y-8">
            {sections.map((s, i) => (
              <RevealSection key={s.title} delay={80 + i * 40}>
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

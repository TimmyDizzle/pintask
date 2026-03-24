import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";

const sections = [
  { title: "1. Information We Collect", text: "We collect: account information (name, email, encrypted password), usage data (boards created, cards moved, features used), user content (board names, card titles, descriptions, comments, attachments), technical data (IP address, browser type, operating system), and essential cookies for session management." },
  { title: "2. How We Use Your Information", text: "To provide and maintain the Pintask service, authenticate your identity and secure your account, send transactional emails (account confirmation, password reset, card reminders), send product updates (you can opt out anytime), analyze usage and improve the product, respond to support requests, and detect and prevent fraud or abuse." },
  { title: "3. Data Sharing", text: "We do not sell your personal data. Ever. We share data only with service providers who help us operate Pintask (hosting, email delivery, analytics) — bound by data processing agreements, law enforcement if required by valid legal process, and you — you can export all your data at any time." },
  { title: "4. Data Retention", text: "We retain your data for as long as your account is active. If you delete your account, we delete your personal data within 30 days. Some data may be retained in anonymized form for analytics." },
  { title: "5. Your Rights", text: "Depending on your location, you may have the right to: access the personal data we hold about you, correct inaccurate data, request deletion of your data, export your data in a portable format, object to certain processing activities, and withdraw consent at any time. To exercise any of these rights, email us at: privacy@pintask.online" },
  { title: "6. Security", text: "We use industry-standard encryption (TLS/HTTPS) for all data in transit. Passwords are hashed and never stored in plain text. We conduct regular security reviews." },
  { title: "7. Children's Privacy", text: "Pintask is not directed at children under 13. We do not knowingly collect data from children under 13. If you believe we have inadvertently collected such data, contact us immediately." },
  { title: "8. Changes to This Policy", text: "We will notify registered users by email of any material changes to this policy at least 14 days before they take effect." },
  { title: "9. Contact", text: "Privacy questions: privacy@pintask.online" },
];

export default function PrivacyPage() {
  useDocumentTitle("Privacy Policy — Pintask", "Pintask's privacy policy. How we collect, use, and protect your data.");

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection className="text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: March 24, 2026</p>
          </RevealSection>
          <RevealSection delay={50}>
            <p className="mt-8 text-sm text-muted-foreground leading-relaxed">Pintask ("we," "our," or "us") operates pintask.online. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
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

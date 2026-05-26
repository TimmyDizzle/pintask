import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import MarketingLayout from "@/components/MarketingLayout";
import RevealSection from "@/components/RevealSection";
import termsMd from "@/content/terms.md?raw";

export default function TermsPage() {
  useDocumentTitle(
    "Terms of Service — Pintask",
    "Pintask's Terms of Service. Your rights, our responsibilities, and the rules that keep the platform fair for everyone."
  );

  return (
    <MarketingLayout>
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <RevealSection>
            <article className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-heading prose-headings:tracking-tight prose-h1:text-4xl prose-h1:font-extrabold prose-h2:text-xl prose-h2:mt-10 prose-h3:text-lg prose-a:text-primary prose-table:text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{termsMd}</ReactMarkdown>
            </article>
          </RevealSection>
        </div>
      </section>
    </MarketingLayout>
  );
}

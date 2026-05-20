import React from "react";

/**
 * Tiny Markdown-lite renderer for blog post bodies.
 * Supports: ## H2, ### H3, paragraphs, blank-line separation, - bullets,
 * **bold**, and `inline code`. No external deps.
 */
export default function BlogContent({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");
  let i = 0;
  let key = 0;

  const renderInline = (text: string): React.ReactNode => {
    // Split by **bold** and `code`, preserve order.
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let n = 0;
    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith("**")) {
        parts.push(<strong key={`b-${n++}`} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>);
      } else {
        parts.push(
          <code key={`c-${n++}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground">
            {tok.slice(1, -1)}
          </code>,
        );
      }
      last = m.index + tok.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <h3 key={key++} className="mt-8 font-heading text-xl font-semibold tracking-tight">
          {renderInline(line.slice(4))}
        </h3>,
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <h2 key={key++} className="mt-12 font-heading text-2xl font-bold tracking-tight">
          {renderInline(line.slice(3))}
        </h2>,
      );
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <pre
          key={key++}
          className="mt-4 overflow-x-auto rounded-lg border border-border/50 bg-muted/50 p-4 text-sm"
          data-lang={lang}
        >
          <code className="font-mono text-foreground">{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph (consume until blank line)
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") && !lines[i].startsWith("- ") && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith("```")) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="mt-4 leading-relaxed text-muted-foreground">
        {renderInline(buf.join(" "))}
      </p>,
    );
  }

  return <div className="text-[15px]">{blocks}</div>;
}

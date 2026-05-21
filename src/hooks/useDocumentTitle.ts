import { useEffect } from "react";

const BASE_TITLE = "Pintask — Personal Task Tracker";
const SITE_ORIGIN = "https://pintask.online";
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

type JsonLd = Record<string, unknown> | Record<string, unknown>[];

export function useDocumentTitle(title?: string, description?: string, options?: { jsonLd?: JsonLd; ogType?: string; ogImage?: string }) {
  useEffect(() => {
    const finalTitle = title || BASE_TITLE;
    document.title = finalTitle;

    const url = `${SITE_ORIGIN}${window.location.pathname}`;
    const ogType = options?.ogType || "website";
    const ogImage = options?.ogImage || DEFAULT_OG_IMAGE;

    if (description) {
      upsertMeta('meta[name="description"]', "name", "description", description);
    }
    upsertLink("canonical", url);
    upsertMeta('meta[property="og:title"]', "property", "og:title", finalTitle);
    if (description) upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertMeta('meta[property="og:type"]', "property", "og:type", ogType);
    upsertMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", finalTitle);
    if (description) upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    upsertMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    let jsonLdEl: HTMLScriptElement | null = null;
    if (options?.jsonLd) {
      jsonLdEl = document.createElement("script");
      jsonLdEl.type = "application/ld+json";
      jsonLdEl.setAttribute("data-route-jsonld", "true");
      jsonLdEl.text = JSON.stringify(options.jsonLd);
      document.head.appendChild(jsonLdEl);
    }

    return () => {
      document.title = BASE_TITLE;
      if (jsonLdEl && jsonLdEl.parentNode) jsonLdEl.parentNode.removeChild(jsonLdEl);
    };
  }, [title, description, options?.ogType, options?.ogImage, JSON.stringify(options?.jsonLd)]);
}

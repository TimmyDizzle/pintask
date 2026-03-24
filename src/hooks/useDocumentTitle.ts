import { useEffect } from "react";

const BASE_TITLE = "Pintask — Personal Task Tracker";

export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title || BASE_TITLE;
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}

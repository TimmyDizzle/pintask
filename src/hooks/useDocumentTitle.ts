import { useEffect } from "react";

const BASE_TITLE = "Pintask — Personal Task Tracker";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Pintask` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}

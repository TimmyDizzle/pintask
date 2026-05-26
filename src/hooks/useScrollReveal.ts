import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  once?: boolean;
  initialVisible?: boolean;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, once = true, initialVisible = false } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(initialVisible);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return { ref, isVisible };
}

import { useEffect, useState } from "react";
import { Contrast } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "pintask:high-contrast";

export function useHighContrast() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setEnabled(stored === "true");
      return;
    }
    setEnabled(window.matchMedia("(prefers-contrast: more)").matches);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", enabled);
  }, [enabled]);

  const toggle = (next: boolean) => {
    setEnabled(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return { enabled, toggle };
}

export default function HighContrastToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useHighContrast();

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Contrast className="h-4 w-4 text-gray-400" aria-hidden="true" />
      <label htmlFor="high-contrast-toggle" className="text-xs text-gray-400">
        High contrast
      </label>
      <Switch
        id="high-contrast-toggle"
        checked={enabled}
        onCheckedChange={toggle}
        aria-label="High contrast reading mode"
      />
    </div>
  );
}

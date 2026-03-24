import { useScrollReveal } from "@/hooks/useScrollReveal";

const revealBase = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";
const revealHidden = "opacity-0 translate-y-5 blur-[4px]";
const revealVisible = "opacity-100 translate-y-0 blur-0";

export default function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`${revealBase} ${isVisible ? revealVisible : revealHidden} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

/**
 * A glowing purple "lightning ball" that pulses, breathes and fires
 * occasional electric arcs, with a subtle cursor parallax.
 * Purely decorative. Respects prefers-reduced-motion.
 */
export default function PurpleLightningOrb({
  className = "",
  size = 420,
  parallax = 1,
}: {
  className?: string;
  size?: number;
  /** Multiplier for how far the orb drifts with the cursor. */
  parallax?: number;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [strike, setStrike] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Cursor parallax (normalised -1..1 from viewport centre)
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: MouseEvent) => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        setPointer({
          x: (e.clientX / window.innerWidth - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;
    let timer: number;
    const loop = () => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setStrike((n) => n + 1);
        loop();
      }, 1800 + Math.random() * 3200);
    };
    loop();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reducedMotion]);

  const arcs = [
    "M50 8 C58 28 40 34 52 50 C62 64 46 72 54 92",
    "M8 50 C30 44 34 62 50 52 C66 42 72 58 92 48",
    "M20 20 C36 34 30 46 48 50 C66 54 62 70 80 82",
    "M80 22 C64 34 70 48 50 52 C32 56 34 70 20 80",
  ];

  // Depth layers: halo drifts least, arcs most.
  const shift = (depth: number) => ({
    transform: `translate3d(${pointer.x * depth * parallax}px, ${pointer.y * depth * parallax}px, 0)`,
    transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
    willChange: "transform",
  });

  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer halo */}
      <div className="absolute inset-0" style={shift(8)}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.45), hsl(var(--primary) / 0.12) 45%, transparent 70%)",
            filter: "blur(28px)",
            animation: reducedMotion ? undefined : "orb-breathe 7s ease-in-out infinite",
          }}
        />
      </div>

      {/* Rotating energy ring */}
      <div className="absolute inset-0" style={shift(16)}>
        <div
          className="absolute rounded-full"
          style={{
            inset: "14%",
            background:
              "conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.5), transparent 35%, hsl(var(--accent) / 0.35), transparent 70%)",
            filter: "blur(14px)",
            animation: reducedMotion ? undefined : "orb-spin 16s linear infinite",
          }}
        />
      </div>

      {/* Core */}
      <div className="absolute inset-0" style={shift(24)}>
        <div
          className="absolute rounded-full"
          style={{
            inset: "26%",
            background:
              "radial-gradient(circle at 40% 35%, hsl(var(--primary-foreground) / 0.7), hsl(var(--primary) / 0.85) 35%, hsl(var(--primary) / 0.25) 70%, transparent 80%)",
            filter: "blur(6px)",
            animation: reducedMotion ? undefined : "orb-core 3.4s ease-in-out infinite",
          }}
        />
      </div>

      {/* Lightning arcs */}
      <div className="absolute inset-0" style={shift(32)}>
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary)))" }}
        >
          {arcs.map((d, i) => (
            <path
              key={`${i}-${strike}`}
              d={d}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={0.7}
              strokeLinecap="round"
              opacity={reducedMotion ? 0.18 : 0}
              style={
                reducedMotion
                  ? undefined
                  : { animation: `orb-arc 420ms ease-out ${i * 60}ms 1` }
              }
            />
          ))}
        </svg>
      </div>

      <style>{`
        @keyframes orb-breathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.12); opacity: 1; }
        }
        @keyframes orb-core {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          45%      { transform: scale(1.06); opacity: 1; }
        }
        @keyframes orb-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orb-arc {
          0%   { opacity: 0; }
          15%  { opacity: 0.95; }
          40%  { opacity: 0.25; }
          60%  { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

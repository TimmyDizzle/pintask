import { useEffect, useRef, useState } from "react";

/**
 * Neon thunder clouds:
 * - Soft drifting cloud blobs built from layered radial gradients.
 * - Occasional "lightning" flashes light a random cloud from within.
 * - Disabled motion / flashes when prefers-reduced-motion is set.
 */

type Cloud = {
  id: number;
  top: string;
  left: string;
  size: number; // px
  hue: number; // 0-360
  drift: string; // animation name
  duration: number; // s
  delay: number; // s
  opacity: number;
};

const CLOUDS: Cloud[] = [
  { id: 1, top: "8%",  left: "-6%",  size: 520, hue: 265, drift: "cloud-drift-a", duration: 38, delay: 0,  opacity: 0.55 },
  { id: 2, top: "22%", left: "55%",  size: 620, hue: 205, drift: "cloud-drift-b", duration: 46, delay: 3,  opacity: 0.50 },
  { id: 3, top: "55%", left: "10%",  size: 460, hue: 305, drift: "cloud-drift-c", duration: 42, delay: 6,  opacity: 0.45 },
  { id: 4, top: "62%", left: "62%",  size: 540, hue: 185, drift: "cloud-drift-a", duration: 50, delay: 2,  opacity: 0.50 },
  { id: 5, top: "35%", left: "30%",  size: 380, hue: 285, drift: "cloud-drift-b", duration: 34, delay: 8,  opacity: 0.40 },
];

function cloudBackground(hue: number) {
  // Layered radial gradients to give a soft, puffy neon cloud silhouette.
  return [
    `radial-gradient(closest-side at 30% 40%, hsla(${hue}, 95%, 70%, 0.55), hsla(${hue}, 95%, 60%, 0.18) 55%, transparent 75%)`,
    `radial-gradient(closest-side at 65% 55%, hsla(${(hue + 25) % 360}, 95%, 72%, 0.50), transparent 70%)`,
    `radial-gradient(closest-side at 50% 70%, hsla(${(hue + 340) % 360}, 95%, 65%, 0.40), transparent 70%)`,
    `radial-gradient(closest-side at 50% 50%, hsla(${hue}, 90%, 55%, 0.30), transparent 80%)`,
  ].join(", ");
}

export default function AnimatedHeroBackground() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flashId, setFlashId] = useState<number | null>(null);
  const flashTimer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Random thunder flashes
  useEffect(() => {
    if (reducedMotion) return;
    let cancelled = false;

    const scheduleNext = () => {
      // Long quiet pauses with occasional bursts (like distant thunder).
      const wait = 4000 + Math.random() * 9000;
      flashTimer.current = window.setTimeout(() => {
        if (cancelled) return;
        const id = CLOUDS[Math.floor(Math.random() * CLOUDS.length)].id;
        setFlashId(id);
        // Occasional double-flash
        const double = Math.random() < 0.45;
        window.setTimeout(() => {
          if (cancelled) return;
          setFlashId(null);
          if (double) {
            window.setTimeout(() => {
              if (cancelled) return;
              setFlashId(id);
              window.setTimeout(() => {
                if (!cancelled) setFlashId(null);
                scheduleNext();
              }, 180);
            }, 160);
          } else {
            scheduleNext();
          }
        }, 220);
      }, wait);
    };
    scheduleNext();

    return () => {
      cancelled = true;
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, [reducedMotion]);

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40 md:opacity-70"
      aria-hidden="true"
      data-decorative="true"
    >
      {/* Deep night gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsla(250, 70%, 18%, 0.55), transparent 60%), radial-gradient(ellipse at 80% 100%, hsla(200, 80%, 16%, 0.45), transparent 55%)",
        }}
      />

      {/* Clouds */}
      {CLOUDS.map((c) => {
        const isFlashing = flashId === c.id;
        return (
          <div
            key={c.id}
            className="absolute rounded-full"
            style={{
              top: c.top,
              left: c.left,
              width: c.size,
              height: c.size * 0.7,
              opacity: c.opacity,
              filter: `blur(40px) saturate(140%)`,
              backgroundImage: cloudBackground(c.hue),
              animation: reducedMotion
                ? undefined
                : `${c.drift} ${c.duration}s ease-in-out ${c.delay}s infinite, cloud-pulse ${c.duration / 3}s ease-in-out ${c.delay}s infinite`,
              transition: "filter 220ms ease-out, opacity 220ms ease-out",
              ...(isFlashing
                ? {
                    filter: `blur(28px) saturate(180%) brightness(2.2)`,
                    opacity: Math.min(1, c.opacity + 0.35),
                  }
                : {}),
            }}
          />
        );
      })}

      {/* Soft full-scene flash veil during thunder */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, hsla(220, 100%, 85%, 0.12), transparent 60%)",
          opacity: flashId !== null ? 1 : 0,
          mixBlendMode: "screen",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <style>{`
        @keyframes cloud-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(40px, -20px, 0) scale(1.05); }
        }
        @keyframes cloud-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(-50px, 25px, 0) scale(1.08); }
        }
        @keyframes cloud-drift-c {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(30px, 30px, 0) scale(0.96); }
        }
        @keyframes cloud-pulse {
          0%, 100% { filter: blur(40px) saturate(140%) brightness(1); }
          50%      { filter: blur(36px) saturate(160%) brightness(1.25); }
        }
      `}</style>
    </div>
  );
}

/**
 * Soft, low-intensity animated purple-to-indigo gradient wash that sits
 * behind every landing section. Decorative only.
 */
export default function AmbientGradientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, hsl(var(--primary) / 0.07), transparent 45%, hsl(250 65% 45% / 0.06) 75%, hsl(var(--accent) / 0.05))",
        }}
      />
      {/* Drifting blobs */}
      <div
        className="absolute -left-[15%] top-[-10%] h-[70vh] w-[70vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.09), transparent 70%)",
          filter: "blur(60px)",
          animation: "ambient-drift-a 34s ease-in-out infinite",
        }}
      />
      <div
        className="absolute right-[-20%] top-[25%] h-[80vh] w-[75vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(255 70% 55% / 0.04), transparent 70%)",
          filter: "blur(70px)",
          animation: "ambient-drift-b 44s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-25%] left-[20%] h-[60vh] w-[60vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(265 75% 60% / 0.07), transparent 70%)",
          filter: "blur(60px)",
          animation: "ambient-drift-c 38s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes ambient-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(6%, 4%, 0) scale(1.08); }
        }
        @keyframes ambient-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(-7%, -5%, 0) scale(1.1); }
        }
        @keyframes ambient-drift-c {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50%      { transform: translate3d(4%, -6%, 0) scale(0.94); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-static { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function AnimatedHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft animated blobs */}
      <div
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full opacity-20 blur-[80px]"
        style={{
          background: "hsl(var(--primary))",
          animation: "float1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full opacity-15 blur-[100px]"
        style={{
          background: "hsl(var(--primary))",
          animation: "float2 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full opacity-10 blur-[90px]"
        style={{
          background: "hsl(var(--primary))",
          animation: "float3 16s ease-in-out infinite",
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

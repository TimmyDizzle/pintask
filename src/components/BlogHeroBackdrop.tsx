import { Pin } from "lucide-react";

const cards = [
  { top: "12%", left: "6%", w: "170px", h: "96px", rotate: "-6deg", delay: "0s", duration: "52s" },
  { top: "58%", left: "14%", w: "130px", h: "80px", rotate: "5deg", delay: "-8s", duration: "64s" },
  { top: "20%", left: "72%", w: "190px", h: "110px", rotate: "7deg", delay: "-16s", duration: "58s" },
  { top: "64%", left: "80%", w: "140px", h: "86px", rotate: "-4deg", delay: "-24s", duration: "70s" },
  { top: "40%", left: "45%", w: "160px", h: "92px", rotate: "3deg", delay: "-12s", duration: "60s" },
];

export default function BlogHeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent" />
      <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      {cards.map((c, i) => (
        <div
          key={i}
          className="blog-hero-card absolute"
          style={{
            top: c.top,
            left: c.left,
            width: c.w,
            height: c.h,
            animationDelay: c.delay,
            animationDuration: c.duration,
          }}
        >
          <div
            className="relative h-full w-full rounded-xl border border-primary/20 bg-primary/10 backdrop-blur-sm"
            style={{ transform: `rotate(${c.rotate})` }}
          >
            <Pin className="absolute -right-2 -top-2 h-4 w-4 text-primary/40" />
            <div className="space-y-2 p-3">
              <div className="h-2 w-3/4 rounded-full bg-primary/20" />
              <div className="h-2 w-1/2 rounded-full bg-primary/15" />
            </div>
          </div>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}

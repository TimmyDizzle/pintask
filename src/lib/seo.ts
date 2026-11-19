export const SITE_ORIGIN = "https://pintask.online";
export const BASE_TITLE = "Pintask — Kanban Productivity App for ADHD Brains";
export const BASE_DESCRIPTION = "Turn ADHD overwhelm into clear next steps with Pintask. Organize tasks on visual Kanban boards, break down big projects, and let AI guide your next move.";

export const PUBLIC_PAGE_SEO: Record<string, { title: string; description: string }> = {
  "/": { title: BASE_TITLE, description: BASE_DESCRIPTION },
  "/features": { title: "ADHD Productivity Tools & Kanban Features — Pintask", description: "Explore Pintask's ADHD-friendly tools: AI Next Action, Break It Down, Brain Dump, voice capture, and momentum tracking alongside visual Kanban boards." },
  "/pricing": { title: "ADHD Productivity App Plans & Pricing — Pintask", description: "Compare Pintask plans for ADHD-friendly task management. Find the right option for visual Kanban boards, AI-guided next steps, and everyday productivity." },
  "/extensions": { title: "ADHD Workflow Tools & Extensions — Pintask", description: "Explore Pintask's workflow tools and extensions for ADHD-friendly task management, with options for organizing work and tracking time." },
  "/trello-alternative": { title: "ADHD-Friendly Trello Alternative — Pintask", description: "Looking for a Trello alternative for ADHD? Explore Pintask's visual Kanban boards, AI-guided next actions, task breakdowns, and momentum tracking." },
  "/kanban-board": { title: "Kanban Board for ADHD Task Management — Pintask", description: "Make work easier to see with Pintask's ADHD-friendly Kanban board. Organize tasks visually, prioritize your next step, and track progress without overwhelm." },
  "/task-tracker": { title: "ADHD-Friendly Task Tracker & AI Next Steps — Pintask", description: "Turn scattered thoughts into actionable tasks with Pintask's ADHD-friendly task tracker. Capture ideas, break down projects, and choose your next step." },
  "/about": { title: "About Pintask — Productivity Built for ADHD Brains", description: "Discover the story behind Pintask, an ADHD-friendly productivity app combining visual Kanban task management with AI tools for focus and forward momentum." },
  "/blog": { title: "ADHD Productivity Tips & Kanban Guides — Pintask Blog", description: "Read practical guides to ADHD productivity, Kanban workflows, task planning, and managing overwhelm. Find ideas for clearer next steps and steady progress." },
  "/privacy": { title: "Privacy Policy — Pintask ADHD Productivity App", description: "Read how Pintask collects, uses, and protects your information when you use our ADHD-friendly task management app and website." },
  "/terms": { title: "Terms of Service — Pintask ADHD Productivity App", description: "Read the terms for using Pintask's ADHD-friendly productivity app, including your rights, responsibilities, and the rules for using the service." },
  "/jv": { title: "Affiliate Partners — Pintask ADHD Productivity App", description: "Explore Pintask's partner program and resources for introducing an ADHD-friendly Kanban productivity app to your audience." },
  "/jvsalespage": { title: "Get Pintask — ADHD-Friendly Kanban Productivity App", description: "Explore Pintask's ADHD-friendly productivity offer. Organize tasks visually, turn big projects into manageable steps, and build momentum with AI guidance." },
};

export function normalizePagePath(path: string): string {
  return path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
}

export function canonicalUrl(path: string): string {
  return `${SITE_ORIGIN}${normalizePagePath(path)}`;
}

export function blogSeo(post: { title: string; excerpt: string; seo_title?: string | null; seo_description?: string | null }) {
  const title = (post.seo_title || post.title).replace(/\s*[—|–-]\s*Pintask(?: Blog)?$/i, "").trim();
  const description = (post.seo_description || post.excerpt).trim();
  return {
    title: `${title} — ${/\bADHD\b/i.test(title) ? "Pintask Blog" : "Pintask ADHD Blog"}`,
    description: /\bADHD\b/i.test(description) ? description : `${description} Practical insights for ADHD-friendly productivity with Pintask.`,
  };
}
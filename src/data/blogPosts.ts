export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  featured?: boolean;
  /** Markdown-lite content. Supports # H1, ## H2, ### H3, paragraphs, - bullets, **bold**, blank lines. */
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "best-trello-alternatives-2026",
    title: "The 7 Best Trello Alternatives in 2026 (Free & Paid)",
    category: "Productivity",
    date: "May 20, 2026",
    readTime: "12 min read",
    excerpt:
      "Teams are leaving Trello in droves. We compare the 7 best alternatives — including one built by developers, for developers.",
    featured: true,
    content: `## Why people are leaving Trello in 2026

Trello changed pricing three times in the last two years. Power-Ups got gated. Butler automations got rate-limited. For a lot of small teams, the math stopped working.

If you've been hunting for a replacement, this is the shortlist worth your time.

## The 7 best Trello alternatives

### 1. Pintask — best for indie makers and small teams

**Free forever** for personal use, **$39 lifetime** for the Co-Founder tier. The board feels exactly like Trello — drag, drop, labels, due dates — but the customization story is wildly different. Every panel is an extension, so you only ship the features you actually use.

- Keyboard-first (press \`?\` anywhere)
- Built-in AI quick-add ("remind me to call Mike Friday")
- One-click Trello import

### 2. Notion — best if you want docs + boards in one place

Notion's board view is solid, but it's not the product. If you live in docs and only occasionally need Kanban, Notion is the obvious pick. If Kanban is your primary view, it'll feel slow.

### 3. Linear — best for product and engineering teams

Opinionated, fast, beautiful. Linear is purpose-built for software teams running sprints. Not a Trello replacement for marketing or ops — it's a different category.

### 4. ClickUp — best if you want every feature ever invented

ClickUp will do anything. That's the pitch and the warning. Powerful, but the learning curve is real.

### 5. Asana — best for managers tracking dependencies

Strong timeline view, strong reporting. Free tier is generous. Boards feel less "playful" than Trello but they're functional.

### 6. Jira — best if your org already runs on Atlassian

You know if this is you. If it isn't, skip it.

### 7. Plain Markdown + a folder — best for solo control freaks

Don't laugh. A lot of senior engineers we know run their whole life off \`todo.md\` in a Git repo. Free, portable, no vendor lock-in.

## How to pick

Ask yourself three questions:

1. **Solo or team?** Solo → Pintask or Markdown. Team → Linear, Asana, or Pintask.
2. **Do you need docs in the same tool?** Yes → Notion. No → skip it.
3. **Do you want to own your data forever?** Lifetime deal (Pintask) or self-hosted (Markdown) win that round.

## Migrating from Trello

If you land on Pintask, import takes about 2 minutes — paste a Trello board URL, every list and card transfers. No API keys, no CSV gymnastics.

Most other tools listed have Trello importers too, but quality varies. Notion's importer flattens checklists into bullet text. Linear's doesn't preserve labels. Test with one board before committing.

## Bottom line

If you're a small team or solo maker tired of subscription creep, the **Co-Founder Lifetime ($39, capped at 500 seats)** is the most aggressive offer in this space right now. Everything else is a monthly bill that grows every year.`,
  },
  {
    slug: "build-custom-kanban-board-javascript",
    title: "How to Build a Custom Kanban Board with JavaScript",
    category: "Tutorials",
    date: "May 18, 2026",
    readTime: "10 min read",
    excerpt:
      "Most Kanban tools limit what you can build. Here's how to use modern JS APIs to create exactly what your team needs.",
    content: `## Why build your own Kanban?

Off-the-shelf tools are great until they're not. The moment you need a column that auto-archives after 30 days, or a card that pings Slack when it crosses a swim lane, you hit a wall.

This guide shows the minimum viable Kanban in vanilla JS, then how to extend it.

## The data model

A Kanban board is three nested arrays:

\`\`\`ts
type Card = { id: string; title: string; description?: string };
type Column = { id: string; title: string; cards: Card[] };
type Board = { id: string; title: string; columns: Column[] };
\`\`\`

That's it. Everything else (labels, due dates, attachments) is metadata you bolt onto \`Card\`.

## Drag and drop without a library

The HTML5 drag-and-drop API is clunky but it works:

\`\`\`ts
card.addEventListener("dragstart", (e) => {
  e.dataTransfer?.setData("text/plain", card.dataset.id!);
});

column.addEventListener("dragover", (e) => e.preventDefault());
column.addEventListener("drop", (e) => {
  const cardId = e.dataTransfer?.getData("text/plain");
  moveCard(cardId, column.dataset.id!);
});
\`\`\`

For production, use \`@dnd-kit/core\`. The native API doesn't handle touch well and the visual affordances are limited.

## Persistence

Three tiers, pick one:

- **localStorage** — fine for solo, breaks the moment you open a second device
- **A simple backend** (Supabase, Firebase) — the right answer for 95% of cases
- **CRDTs** (Yjs, Automerge) — the right answer if you need real-time multi-user without conflict pain

## Extension points worth building

- **Card templates** — checklist + label preset, applied with one click
- **Filter modes** — show only cards assigned to me, or due this week
- **Bulk actions** — select 10 cards, move them all
- **Keyboard navigation** — arrow keys to move between cards, \`E\` to edit

## When to stop and use Pintask

Honestly? When you realize you've spent 40 hours on drag-and-drop bugs. The whole reason Pintask exists is that we built this six times and got tired of it. The \`Pintask JS\` extension API gives you a sandboxed slot in the UI where you can ship custom logic without owning the board chrome.

But if learning is the point, build it from scratch. You'll understand every Kanban tool you ever touch afterward.`,
  },
  {
    slug: "kanban-best-practices",
    title: "Kanban Board Best Practices for High-Performing Teams",
    category: "Kanban",
    date: "May 15, 2026",
    readTime: "9 min read",
    excerpt:
      "The 5 most common Kanban mistakes teams make — and how to structure your lists, limits, and boards for maximum flow.",
    content: `## Kanban is simple. Doing it well is not.

After watching hundreds of teams set up Kanban boards, the same five mistakes keep showing up. Here's the fix for each.

## Mistake 1: Too many columns

If your board has more than 5–6 columns, you're modeling a Gantt chart, not a flow. Start with **Backlog → In Progress → Review → Done**. Add columns only when you have evidence work is genuinely stalling at a new stage.

## Mistake 2: No WIP limits

"Work in progress" limits cap how many cards can sit in a column at once. Without them, "In Progress" becomes a junk drawer. Set a limit equal to **team size minus one**. When the column is full, nobody can pull new work — they have to help finish what's already there.

## Mistake 3: Cards that aren't outcomes

A good card describes a **done state**, not an activity:

- ❌ "Work on auth"
- ✅ "User can sign in with Google and see /dashboard"

If you can't describe what "done" looks like, the card isn't ready to start.

## Mistake 4: No cycle time tracking

How long does the average card take from "In Progress" to "Done"? If you don't know, you can't improve it. Cycle time is the single most predictive metric in software delivery — track it weekly.

## Mistake 5: Treating the board as a museum

Boards rot. Cards from three months ago that nobody will ever do clog the backlog. Hold a 15-minute "garden" session every Friday: archive anything that hasn't moved in 30 days. If it matters, it'll come back.

## The high-performing team pattern

The teams we see shipping the most all do the same four things:

1. **Daily standup at the board**, not in chat. Five minutes, one question: *"What's blocking the leftmost card?"*
2. **Pull, don't push.** Nobody assigns work. The person finishing a card picks the next one.
3. **Definition of done** written on the board itself, not buried in a wiki.
4. **Weekly cycle time review** — one number, trending down.

That's it. Kanban is a discipline, not a tool. The tool just makes the discipline visible.`,
  },
  {
    slug: "migrate-from-trello-to-pintask",
    title: "How to Migrate from Trello to Pintask in Under 5 Minutes",
    category: "Tutorials",
    date: "May 12, 2026",
    readTime: "4 min read",
    excerpt:
      "Step-by-step walkthrough: import your entire Trello workspace in 2 clicks. All boards, lists, and cards transfer instantly.",
    content: `## What transfers

Everything visible on your Trello card:

- Boards, lists, and cards with full descriptions
- Labels (colors preserved)
- Due dates and checklists
- Attachments (re-uploaded to Pintask storage)
- Comments (with original author names)

What doesn't (yet): Power-Up data, Butler automations, custom fields. Those need to be rebuilt — usually in less time than you'd think.

## The 4 steps

### 1. Export your Trello board

In Trello, open the board → **Show menu** → **More** → **Print and Export** → **Export as JSON**. Save the file.

### 2. Open Pintask and start the importer

Sign in to Pintask → **Settings → Import** → **Trello (JSON)**.

### 3. Drop the file in

The importer reads the JSON, shows you a preview of what it found, and lets you map Trello labels to Pintask labels (or keep them identical).

### 4. Click Import

That's it. The board appears in your sidebar within a few seconds.

## What about multiple boards?

Repeat for each one, or zip them together and use the bulk importer (available on the Co-Founder Lifetime tier and above). The bulk importer handles 50+ boards in a single shot.

## Common questions

**Will my teammates lose access?** No — the import is to *your* workspace. To bring teammates over, invite them after import; they'll see the boards you've shared.

**Can I run Trello and Pintask in parallel?** Yes. A lot of teams do this for a week before fully switching, just to make sure nothing was missed.

**What if I want to go back?** Pintask exports the same JSON format Trello uses, so you can always reverse the migration. No lock-in.

## Why people don't switch back

The most common feedback after a Trello → Pintask migration: *"I forgot how much faster keyboard shortcuts make this."* Press \`?\` on any board to see the full list.`,
  },
];

export const getPostBySlug = (slug: string) => blogPosts.find((p) => p.slug === slug);

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
  {
    slug: "personal-task-management-guide",
    title: "Personal Task Management: A Complete 2026 Guide for Busy People",
    category: "Productivity",
    date: "May 21, 2026",
    readTime: "11 min read",
    excerpt:
      "A practical, no-fluff system for managing personal tasks — capture, clarify, organize, and review — that scales from 5 to 500 open items.",
    content: `## Why personal task management breaks down

Most people don't have a task problem. They have a *capture* problem, a *trust* problem, and a *review* problem — and the symptoms all look the same: a sticky-note graveyard, a Notes app with 400 untitled entries, and a vague sense that something important is slipping.

The good news: personal task management is one of the few areas of life where a small amount of structure pays back enormous compound interest. Spend an hour setting up a system you trust and you'll claw back hours every single week.

## The 4 jobs a personal task system has to do

A working system has to do four things — in this order. Skip a step and the whole thing collapses within a month.

### 1. Capture everything, instantly

The moment a task enters your head, it has to land *somewhere* outside your head. Your brain is for *having* ideas, not for *storing* them. Pick one inbox — a single place where every task goes first, no exceptions. A mobile shortcut to a "quick add" screen is non-negotiable. If capture takes more than three seconds, you won't do it.

### 2. Clarify what each item actually is

Most inbox items aren't tasks. They're vague nouns — "mom's birthday," "tax stuff," "that podcast idea." Before anything can be acted on, you have to ask: *What's the very next physical action?* "Call dentist" beats "dentist." "Draft outline for Q3 review" beats "Q3 review."

### 3. Organize by context, not by category

The classic mistake is sorting tasks by life area (Work / Home / Side Project). It feels tidy but it's useless in the moment — you don't pick tasks by category, you pick them by what you can *do right now*. Better tags: \`@phone\`, \`@errand\`, \`@desk\`, \`@deep-work\`, \`@15min\`. When you have a free 15 minutes, you filter by \`@15min\` and pick.

### 4. Review weekly — non-negotiable

The single highest-leverage productivity habit in existence is a 30-minute weekly review. Empty your inbox. Re-read every active project. Move stale items to "Someday." Pick three priorities for the next seven days. Skip this for two weeks and your system will rot. There is no exception.

## A starter setup that actually works

You don't need a complex tool. You need *one* tool you'll actually open daily.

- **Inbox list** — the only place quick-add writes to
- **Today** — at most 3-5 items, picked during your morning planning
- **This week** — committed items for the next 7 days
- **Projects** — anything with more than one action
- **Someday/Maybe** — ideas you don't want to forget but aren't committing to

A Kanban board maps cleanly to this. Columns become statuses (Inbox → Today → Doing → Done). Cards become tasks. Labels become contexts. If you've never tried a board for personal tasks, it's worth a week-long experiment — the visual layout makes overload obvious in a way that flat lists hide.

## Common mistakes that kill personal systems

**Treating every task as equal.** They aren't. Three real priorities per day beats fifteen "important" ones every time.

**Re-inventing the system every month.** Every tool switch is a tax on your future self. Pick one, commit for 90 days, then evaluate.

**Skipping the weekly review.** This is the entire game. If you do nothing else, do this.

**Confusing motion with progress.** Adding tasks is dopamine. Completing them is the job.

## When personal systems graduate to team systems

If you start collaborating — even with one other person — flat lists fall apart fast. That's where a real board with shared columns, comments, and due dates becomes worth the small upfront setup. Pintask is free forever for exactly this transition: start solo, invite a collaborator when you need to, never migrate tools.

## Your first 24 hours

1. Pick one tool. Anything. Stop researching.
2. Do a brain dump — 20 minutes, write down every open loop in your head.
3. Clarify each into a next physical action.
4. Pick three for tomorrow.
5. Schedule a 30-minute weekly review for Friday afternoon.

That's it. The system isn't the win — the *trust* you build in the system is. Once your brain learns it doesn't have to remember everything, the background anxiety quietly disappears.`,
  },
  {
    slug: "kanban-wip-limits-explained",
    title: "Kanban WIP Limits Explained: Why Less Work-in-Progress Means More Done",
    category: "Kanban",
    date: "May 18, 2026",
    readTime: "9 min read",
    excerpt:
      "Work-in-progress limits are the most underused Kanban feature. Here's how to set them, why they work, and the math behind faster delivery.",
    content: `## The single most important Kanban rule nobody enforces

Most teams who "do Kanban" do columns and cards. That's about 20% of the system. The other 80% is **work-in-progress (WIP) limits** — and it's the part that actually makes Kanban work.

A WIP limit is a hard cap on how many cards can sit in a column at once. "Doing" might be limited to 3. "In Review" to 2. If a column is full, you literally cannot pull a new card in until something moves out. That constraint is the entire point.

## Why WIP limits speed teams up (the counterintuitive part)

Every additional task in progress doesn't add capacity — it subtracts it. Three reasons:

### 1. Context switching is a tax you pay invisibly

Research from the University of California Irvine found it takes 23 minutes on average to return to a task after an interruption. Each open card is a potential context switch. Five concurrent cards isn't 5x throughput — it's roughly 1.5x with a much higher error rate.

### 2. Cycle time gets worse, not better

Little's Law: *Cycle Time = WIP ÷ Throughput*. Double your WIP at constant throughput and average cycle time doubles. Customers wait longer for each individual thing to ship, even though more is technically "happening."

### 3. Bottlenecks become invisible

Without WIP limits, a slow review step just accumulates cards quietly. With a WIP limit, the moment "In Review" fills up, every upstream worker hits the cap and has to *help unblock the review* instead of starting new work. The constraint forces the team to attack the bottleneck.

## How to set your first WIP limits

There's no universally correct number. Start with this heuristic and adjust after two weeks of data.

- **Doing column**: number of active workers minus 1 (forces some pair work or slack)
- **In Review**: half the Doing limit, rounded up
- **Blocked**: a soft cap of 2 — more than that and the standup becomes a blocker-fest
- **Backlog / Done**: no limit needed

For a solo personal board: 1 in "Doing," 3 in "Today," unlimited elsewhere. Yes, *one*. The discipline of finishing before starting is where the productivity comes from.

## What to do when a column is full

This is the moment Kanban actually does its job. When you can't pull new work, the team has to ask:

1. **Can I help finish what's already there?** Pair on the blocked card. Review the pending PR. Test the feature waiting on QA.
2. **Is something stuck for a real reason?** If a card has been sitting for days, surface it. Pintask's color-coded due dates make this visible at a glance.
3. **Do we need to renegotiate scope?** Sometimes the answer is splitting a too-large card into smaller ones.

The wrong answer is "raise the WIP limit." That defeats the whole mechanism.

## The visualization advantage

WIP limits only work if everyone can see them. A digital board that shows "4/3" in red when the limit is breached creates immediate social pressure to resolve it. A spreadsheet doesn't. This is one of the few areas where the tool genuinely matters — pick a board that displays WIP counts and column limits clearly.

## Real numbers from a real team

A 6-person engineering team I worked with cut average cycle time from 11.4 days to 4.2 days in six weeks by doing nothing except introducing a WIP limit of 4 on their "In Progress" column. Throughput stayed roughly flat (~12 cards/week). The work just stopped sitting around.

Their developers initially hated it ("but I want to start the next thing!"). Three months later, none of them would go back.

## When to relax the limit

There are two legitimate reasons to temporarily raise a WIP limit:
- **A genuine emergency** — production is down, all hands.
- **A clear pairing situation** — two people working on one card counts as one in WIP, but a quick swarm on a related card is fine.

"I'm bored" is not a reason. "I work faster when I have variety" is also not a reason — it feels true and it isn't.

## The mindset shift

WIP limits aren't about restricting people. They're about **finishing things**. The most productive teams I've seen all share one trait: they have very few cards in flight at any moment, and a steady rhythm of completion. Boring, predictable, and twice as fast as the chaotic alternative.

Try it for two weeks. Set a WIP of 3 on whatever your "in progress" column is called. The discomfort in week one is the system working.`,
  },
  {
    slug: "weekly-review-system",
    title: "The 30-Minute Weekly Review That Will Save Your Productivity System",
    category: "Productivity",
    date: "May 15, 2026",
    readTime: "8 min read",
    excerpt:
      "Every productivity system collapses without a weekly review. Here's exactly what to do in 30 minutes every Friday to keep yours alive.",
    content: `## Why every system you've ever tried eventually died

You've probably done this dance before. New app, fresh setup, color-coded tags, beautifully organized projects. Two weeks of enthusiasm. Then a busy stretch hits, you stop opening it, and three weeks later you can't remember what's in there. So you start over with a different app.

The reason isn't the app. It's that you never built the one habit that keeps every productivity system alive: the **weekly review**.

A weekly review is 30 minutes, once a week, where you reset the entire system. Done consistently, it's the difference between a tool you trust and a graveyard you abandon.

## The 7-step weekly review (do these in order)

### 1. Clear your inboxes (5 min)

Email, task inbox, voice memos, scattered notes, anything that accumulated this week. You're not *processing* them deeply — you're triaging into: trash, do now (<2 min), or capture-to-task.

The point isn't zero email. The point is no captured-but-uncategorized items.

### 2. Process the task inbox (5 min)

Every item that landed in your quick-capture inbox gets one of four destinations:
- **Today/This week** — committed, scheduled
- **Project** — part of a larger outcome, filed there
- **Someday** — interesting but not now
- **Trash** — past you was overcaffeinated

If you can't clarify what the item *is* in 30 seconds, it goes to Someday. Don't stare at it.

### 3. Re-read every active project (10 min)

This is the heart of the review. Open every active project, one by one, and ask:
- Does this project have a clear next action?
- Has anything happened this week that changes the plan?
- Is this project still worth doing?

Most weeks, you'll discover 1-2 projects that have quietly become irrelevant. Kill them without guilt — that's the *point*.

### 4. Review your calendar (3 min)

Look back at the past week and forward at the next two. Past-week review catches missed follow-ups ("I said I'd send Sarah that doc"). Forward-look catches anything you need to prep for.

### 5. Empty the "Waiting On" list (2 min)

If you delegated or asked for something, you should have logged who you're waiting on. Now's the time to nudge anything that's been sitting more than a week.

### 6. Pick three priorities for next week (3 min)

Not 15. Three. If everything is a priority, nothing is. Write them somewhere visible. These are the things that, if you do *only* them, the week is a win.

### 7. Close the laptop (2 min)

Last step is a mental one. The system is reset. You can stop carrying it in your head until next Friday. This is the *whole point* of the review — your brain trusts the system because you tend to it.

## When to do it

Friday afternoon, 4:00 PM, is the canonical answer for a reason:
- The work week is fresh in your mind
- You're winding down anyway (low cognitive cost)
- You enter the weekend genuinely unplugged

Monday morning is the second-best option. Weekend reviews almost never happen — don't pretend otherwise.

## What to do when you miss a week

You will. Everyone does. The recovery move is:
1. Don't try to "catch up" by doing a 2-hour mega-review. You'll hate it and skip it again.
2. Do a normal 30-minute review and accept that some stale stuff will linger.
3. Schedule the next one immediately.

The system tolerates a missed week. It doesn't tolerate three.

## Tooling notes

The tool doesn't matter much, but two features make weekly reviews dramatically faster:

- **A real "Inbox" column or list** — somewhere capture lands by default
- **Project-level views** — you need to be able to see one project at a time

Pintask's board view handles both naturally; any decent Kanban tool will. A flat list (plain Notes app, paper) works for fewer than ~30 active items but starts to drown above that.

## The compounding return

A weekly review takes 30 minutes. The hours it saves you the following week — by surfacing forgotten commitments, killing dead projects, and protecting your priorities — are usually 5-10x that.

That's not productivity advice. That's just math.`,
  },
  {
    slug: "time-blocking-vs-task-lists",
    title: "Time Blocking vs. Task Lists: Which One Should You Actually Use?",
    category: "Productivity",
    date: "May 12, 2026",
    readTime: "9 min read",
    excerpt:
      "Two opposing schools of productivity. Both have die-hard fans. Here's the honest comparison — and the hybrid that beats both.",
    content: `## The eternal productivity debate

Walk into any productivity forum and within five minutes you'll find someone insisting that time blocking is the only real system, and someone else swearing that task lists are all anyone needs. Both groups are right, and both groups are wrong.

Let's settle it.

## What time blocking actually is

Time blocking means assigning every task a *specific window* on your calendar. Not "write the report today" — "write the report from 9:30 to 11:00." Your calendar becomes the source of truth; your task list is just where things go before they get scheduled.

**Strengths:**
- Forces realistic estimates (you can only fit so much in 8 hours)
- Protects deep work from meeting creep
- Eliminates "what should I work on now?" decisions
- Makes overcommitment impossible — your calendar is full or it isn't

**Weaknesses:**
- High overhead (10-15 minutes of planning per day)
- Brittle when interrupted (one emergency cascades)
- Doesn't handle small fragmented tasks well
- Requires calendar discipline most teams don't have

## What task lists actually do

Task lists (or boards) let you keep an inventory of *what* without committing to *when*. You pull the next item when you have capacity. Kanban is task lists with structure.

**Strengths:**
- Low overhead
- Handles interruption gracefully
- Naturally supports collaboration
- Good for variable, reactive work
- Visualizes work in flight (especially in a Kanban board)

**Weaknesses:**
- Easy to overcommit (the list always grows)
- Hard tasks get avoided in favor of easy ones
- No protection from meeting bloat
- "What should I do now?" question is on you every time

## The honest verdict

Time blocking wins when your work is:
- Long-form / deep (writing, research, coding complex features)
- Predictable (similar days, similar inputs)
- Mostly individual

Task lists / Kanban win when your work is:
- Short and varied (support, ops, management)
- Reactive (incoming requests dominate)
- Collaborative (multiple people pulling from the same queue)

Most knowledge workers have *both kinds of weeks*, sometimes in the same day. Which is why the hybrid is what actually works.

## The hybrid: list-driven blocking

Here's the version that holds up under real-world conditions:

### Step 1: Maintain a Kanban board as your master inventory

Everything goes here first. Inbox → Today → Doing → Done. This is your trust layer — you never lose track of an item.

### Step 2: Each morning, time-block only your deep work

Look at "Today." Identify the 1-3 items that need uninterrupted focus. Block calendar time for *those* — usually 2-3 blocks of 60-90 minutes.

### Step 3: Leave the rest of the day unblocked

Don't block every minute. Leave 30-50% of your day open for the inevitable reactive work — Slack messages, code reviews, small follow-ups. Pull these from the board between blocks.

### Step 4: At end of day, drag finished cards to Done

The board reflects reality. The calendar reflects intention. Both stay accurate.

This hybrid takes about 10 minutes of overhead daily and gets you 90% of the benefit of pure time blocking with 30% of the rigidity.

## Common mistakes with each approach

**Time blockers**: Blocking the entire day. You'll abandon the system within a week. Real days have surprises — leave room.

**List people**: Letting the list grow without weekly pruning. A 200-item Today list is just anxiety in a digital container.

**Hybrid people**: Trying to time-block reactive work. You can't pre-schedule "responding to whatever Slack messages come in." Reserve unblocked time for it instead.

## Tool implications

The hybrid only works if your board view is fast enough to glance at multiple times a day. Heavy tools (Notion, ClickUp) slow this down. A purpose-built Kanban board (Pintask, Trello) makes it effortless.

For the calendar side, anything works — Google Calendar, Outlook, paper. The medium isn't the point.

## The meta-point

Productivity systems don't fail because the methodology is wrong. They fail because people pick a system too rigid for how their actual life works, then blame themselves when they can't maintain it.

The right system is one you'll still be using in 90 days. Start with whichever sounds more sustainable to you, run it for two weeks, then layer in the other side as needed. Don't optimize until you have data.`,
  },
  {
    slug: "eisenhower-matrix-with-kanban",
    title: "The Eisenhower Matrix on a Kanban Board: A Visual Prioritization System",
    category: "Productivity",
    date: "May 9, 2026",
    readTime: "7 min read",
    excerpt:
      "Combine the urgent/important matrix with Kanban columns for a prioritization system that actually survives contact with reality.",
    content: `## The famous matrix nobody actually uses

The Eisenhower Matrix is the most-cited productivity framework ever invented. Two axes: urgent vs. not urgent, important vs. not important. Four quadrants:

- **Q1 — Urgent & Important**: Do it now
- **Q2 — Important, Not Urgent**: Schedule it
- **Q3 — Urgent, Not Important**: Delegate it
- **Q4 — Neither**: Delete it

It's appeared in every productivity book of the last fifty years. And almost nobody uses it past the first week. Why? Because the standard 2x2 diagram is great for explaining the concept and *terrible* as a daily working tool. You can't drag tasks across it, you can't filter it, you can't see what's overdue.

The fix: rebuild it as a Kanban board.

## The four-column Eisenhower board

Replace the four quadrants with four columns:

- **Do Now** (urgent + important) — limit: 3 cards
- **Schedule** (important, not urgent) — limit: 10 cards
- **Delegate** (urgent, not important) — limit: 5 cards
- **Delete / Someday** (neither) — no limit

Every new task gets dropped into the appropriate column. The visual layout shows you, at a glance, the shape of your week.

## Why the column version actually works

Three reasons the matrix-as-board outperforms the matrix-as-diagram:

### 1. WIP limits enforce the discipline

The classic matrix tells you to do urgent+important first. The board *prevents* you from having more than three of those at once. If you've got five "Do Now" items, the board makes it obvious that you're calling everything urgent — which means nothing is.

### 2. The Schedule column is the actual productivity multiplier

Eisenhower's real insight was that Quadrant 2 (Important, Not Urgent) is where life-changing work lives — long-term projects, relationships, health, deep skill-building. On a board, this column becomes visible inventory you draw from during your best hours, rather than abstract advice that gets ignored.

### 3. Delegate becomes a real workflow

"Delegate" sounds nice on paper. On a board, the Delegate column has a clear lifecycle: hand off → waiting on → done. You can label each card with who it went to. You can review weekly. Suddenly delegation is a process instead of an aspiration.

## How to seed the board (first 30 minutes)

1. Brain-dump everything you have on your plate into a single inbox column.
2. For each card, ask:
   - Does this have a real deadline this week? → **urgent**
   - If I don't do it, will it cost me something significant? → **important**
3. Drop each card into its quadrant column.
4. Look at "Do Now." If it has more than 3 items, you are lying to yourself. Move the soft ones to "Schedule."

Most people, doing this exercise for the first time, discover that 60-70% of what felt like "urgent" was actually "Delegate" or "Schedule" in disguise.

## The daily flow

Morning: pick from "Do Now" first, then "Schedule" once that's empty (which is the goal).

Throughout the day: when new tasks land, they go into the appropriate column — never straight into "Do Now" unless they genuinely belong.

End of day: move finished cards to Done. Anything in "Do Now" that didn't get done either rolls over (and you need to look hard at why) or gets demoted to "Schedule."

## The weekly review angle

During your weekly review, the Delete / Someday column is where the high-leverage work happens. Most cards that landed there will still belong there a week later. Some will have quietly become important. Most should be archived without guilt.

This is the column that proves the system is working — a healthy Someday list is full of *things you decided not to do*, which is a much more powerful productivity skill than "doing more things."

## Tooling note

Any Kanban tool can run this layout. Pintask happens to have color labels and WIP-limit visualization built in, which makes the "Do Now: 3 max" rule enforce itself. Trello, Notion, or paper sticky notes on a wall also work — pick whatever you'll actually open daily.

## The honest summary

The Eisenhower Matrix isn't a brilliant framework you've been failing to apply. It's a *decent* framework that needed a better interface. Move it onto a board, add WIP limits, and the same idea suddenly becomes a working system instead of a slide in a productivity deck.`,
  },
  {
    slug: "how-to-prioritize-tasks",
    title: "How to Prioritize Tasks When Everything Feels Urgent",
    category: "Productivity",
    date: "May 6, 2026",
    readTime: "8 min read",
    excerpt:
      "Five practical prioritization frameworks, when to use each, and what to do when your to-do list has grown beyond control.",
    content: `## The real prioritization problem

Most prioritization advice assumes a calm, rational moment where you can sit and rank things. The actual scenario is: it's Tuesday, you have 47 open items, three people are pinging you, and you don't know what to start. None of the classical frameworks help unless you know which one to reach for and when.

Here are five that work, ordered roughly from quickest to most rigorous.

## 1. The Two-Question Triage (60 seconds)

When you have 5 minutes and a queue of tasks:

1. *What happens if I don't do this today?* If "nothing," it's not today's task.
2. *Is this the highest-leverage thing I could be doing right now?* If yes, start. If no, switch.

This isn't a real framework. It's a rapid decision filter that gets you working in under a minute. Use it 10 times a day.

## 2. The 1-3-5 Rule (5 minutes, daily)

For your daily plan: commit to one big thing, three medium things, five small things. Total: nine items. That's all that fits in a productive day.

The genius of 1-3-5 is the forced ratios. You can't accidentally schedule eight "big things." It also gives you a clear answer to "did I have a good day?" — did the one big thing get done?

## 3. ICE Score (15 minutes, weekly)

When you have a backlog of *projects* (not individual tasks) and need to rank them, use **ICE**:

- **Impact** (1-10): How much will this matter if it works?
- **Confidence** (1-10): How sure are you it'll work?
- **Effort** (1-10): How much will it cost? (lower is better)

Score: \`Impact × Confidence ÷ Effort\`. Rank the list by score. Do the top 1-3.

ICE works because it forces you to be honest about confidence. The shiny project with 10 Impact but 2 Confidence usually loses to the boring 7-Impact-9-Confidence one — correctly.

## 4. MoSCoW (30 minutes, monthly)

For larger planning horizons (a quarter, a release):

- **M**ust have — non-negotiable
- **S**hould have — important but not required
- **C**ould have — nice if there's time
- **W**on't have — explicitly out of scope this round

The "Won't have" category is the most valuable. Writing things down as explicitly excluded prevents them from creeping back in mid-quarter.

Rule of thumb: Must-have items should be ≤60% of total effort. If they're 100%, you're over-committing.

## 5. The Eisenhower Matrix (when stuck)

Covered in detail in our dedicated post. Best when you're paralyzed and need to *categorize* before you can rank.

## What to do when you have 200+ open items

If your list has gotten out of control, none of the above will fix it. You need to do the unpleasant thing: **the great purge**.

Block a full hour. Open every open project. For each, ask one question: *If I had to delete this right now and could never bring it back, how would I feel in 30 days?*

Most things, the honest answer is "fine" or "relieved." Those get archived.

You'll end the hour with somewhere between 30 and 60 items left. That's a workable list. The 140 you cut weren't real commitments — they were just unprocessed inputs masquerading as commitments. The relief is enormous.

## The leverage you're missing: deciding less

The highest-leverage prioritization move isn't picking better. It's *deciding once*.

- **Standing rules** beat per-task decisions. "I never check email before 11 AM" eliminates 200 micro-decisions a year.
- **Templates** beat custom planning. Same project type → same default plan, modified at the margins.
- **Cadence** beats willpower. Friday weekly review at 4 PM. Always. No deciding.

Every decision you turn into a default is a prioritization battle you don't have to fight again.

## The tool angle

Prioritization frameworks work best on tools that let you see *all* your work at once. A Kanban board with priority labels (P1/P2/P3) or numbered columns (Now / Next / Later) is the natural fit. Pintask supports color labels, due-date sorting, and quick-filter shortcuts, which makes daily 1-3-5 picks take about 90 seconds.

A spreadsheet works too. So does paper. The framework matters more than the tool.

## The mindset shift

Prioritization isn't about doing more. It's about *deciding what not to do* clearly enough that you can do the rest without guilt. Every framework above is really a tool for granting yourself permission to ignore things.

Pick one framework. Use it for two weeks. Don't switch. The compounding clarity is the whole game.`,
  },
  {
    slug: "productivity-tools-for-developers",
    title: "The Best Productivity Tools for Developers in 2026",
    category: "Tutorials",
    date: "May 3, 2026",
    readTime: "10 min read",
    excerpt:
      "A curated stack of tools developers actually use to stay focused, manage tasks, and ship more code — without falling for shiny-app syndrome.",
    content: `## What "productivity" means for developers

Productivity for a developer isn't typing more code per hour. It's spending more of your day in flow on the *right* problems. That means the tools that matter aren't fancy task managers — they're whatever reduces friction in the loop of: *capture an idea → switch context cleanly → return to deep work.*

This is an opinionated stack. Every tool listed is either free or has a generous free tier, and each one earned its place by surviving real day-to-day developer use over months.

## Task and project management

### Pintask — Kanban for personal + small-team work
The free plan is generous enough for a solo developer's entire workflow: unlimited boards, nested cards, keyboard-first navigation, and a full JavaScript API if you want to build custom extensions. The hidden killer feature: hit \`?\` anywhere to see every keyboard shortcut.

### Linear — for product/eng teams running sprints
Opinionated, fast, beautiful. If you're on a team shipping a product, Linear is hard to beat. Solo it's overkill.

### GitHub Issues + Projects — when your work is your repo
For OSS or small teams already deep in GitHub, the built-in Projects view has gotten genuinely good. Less friction than a separate tool when your work *is* the code.

## Capture and notes

### Obsidian — local-first markdown notes
Plain markdown files in a folder. Fast search. Excellent plugin ecosystem. Your notes outlive any company. The cost: setup investment.

### Apple Notes / Google Keep — quick capture
The right tool for "remember to..." is whatever opens in one tap on your phone. Don't over-engineer this.

### Drafts (iOS) — the universal mobile inbox
Opens to a blank screen. Type. Send anywhere — task manager, calendar, email, note app. The fastest capture experience on any phone.

## Focus and deep work

### Cold Turkey / Freedom — block sites at the OS level
The honest truth: willpower-based focus doesn't work for most people. A tool that physically prevents you from reaching Twitter for 90 minutes does.

### Focus / Be Focused — Pomodoro timer that lives in your menu bar
25-minute work blocks with 5-minute breaks. Boring. Effective. The visible countdown is the whole feature.

### Brain.fm / focus@will — functional music
Lyric-free music engineered for focus. Doesn't matter which one — pick one, put it on, train your brain to associate it with deep work.

## Terminal and editor extensions

### fzf — fuzzy finder for everything
Once you wire \`fzf\` into your shell history, file search, and git checkout, going back feels like wading through mud.

### tmux + tmuxinator — session management
Save and restore complete terminal layouts per project. Open the project, restore the layout, you're back in the exact state you left.

### GitHub Copilot / Cursor — AI pair programming
Whatever your stance on AI assistants, they're a clear productivity boost for boilerplate, test scaffolding, and unfamiliar APIs. Treat suggestions as a starting point, not gospel.

### Raycast (macOS) — keyboard launcher on steroids
Replaces Spotlight. Custom snippets, calculator, window management, extensions for everything from GitHub PRs to Jira. The first tool I install on a new Mac.

## Communication

### Slack scheduled send + DND aggressively
The single highest-leverage Slack feature: schedule messages for tomorrow morning instead of sending at 11 PM. You stop training your team to expect off-hours replies. DND from 6 PM to 9 AM is non-negotiable.

### Loom — async video instead of meetings
A 3-minute Loom replaces a 30-minute screen-share meeting at roughly 1/10 the calendar cost. Especially useful for code walkthroughs.

## What didn't make the list (and why)

- **Notion** — Brilliant, but the all-in-one promise becomes "spend more time organizing than working." Use for team docs; not as a personal task manager.
- **Jira** — If you're forced to use it, fine. Don't choose it.
- **Asana / Monday / ClickUp** — Built for managers, not for makers. Too much chrome around each task.
- **Yet another note app** — You don't need a new one. You need to actually use the one you have.

## The minimum viable developer stack

If you want to stop researching and start working, here's the smallest stack that covers everything:

- **Pintask** — personal Kanban board
- **Obsidian** — notes (or Apple Notes if you don't want setup)
- **Cold Turkey** — focus blocking
- **Raycast** — keyboard launcher
- **GitHub Copilot** — AI in editor

Total cost: under $20/month. Setup time: under an hour. Beats 90% of more elaborate stacks because the friction to use each piece is near zero.

## The principle

The best productivity tool is the one with the lowest activation energy. Every tool added to your stack is a small tax on attention. The compound effect of a *small* stack with *zero friction* will outperform a sophisticated stack you have to think about.

Pick the smallest set you can live with. Cut anything you haven't opened in 30 days. Defend the simplicity.`,
  },
  {
    slug: "async-work-task-tracking",
    title: "How to Track Tasks in an Async-First Remote Team",
    category: "Productivity",
    date: "April 30, 2026",
    readTime: "9 min read",
    excerpt:
      "Async teams die from invisible work. Here's the lightweight task-tracking system that keeps everyone unblocked across time zones — without daily standups.",
    content: `## The async paradox

Async-first teams are sold on a promise: deep focus, no meetings, work when your brain works. Most actually deliver the opposite — they end up *more* dependent on synchronous chat than co-located teams, because there's no other coordination mechanism.

The thing that breaks is rarely the tooling. It's the lack of a shared, always-current source of truth for *what's being worked on, by whom, and what's blocked.*

A good task tracker — used the right way — is the entire fix.

## The three failure modes of async task tracking

### Failure 1: Tasks live in chat

Slack threads are not a task tracker. They scroll away. Nobody knows what's still open. New team members can't catch up. If you find yourself searching Slack for "what was that thing Maria asked about last week," your tracking is in the wrong place.

### Failure 2: Tasks live in too many places

Jira for engineering, Asana for marketing, Notion docs for ops. Anyone who works across functions has to check 3 places. They check 0.

### Failure 3: The tracker exists but nobody updates it

The single most common cause of "we tried Kanban and it didn't work" is that cards sat in "In Progress" for three weeks because nobody moved them. The tool was fine. The habit was missing.

## The async task-tracking principles that actually work

### Principle 1: One board per team, always public

Every project a team owns lives on one shared board. Visibility is the entire point — async teams need *anyone* to be able to look at the board and answer "what's in flight?" in under 30 seconds.

### Principle 2: Cards are written for someone in a different time zone reading at 3 AM

Every card needs enough context that someone six hours offset from you can pick it up without asking. Include:
- What needs to be done (the actual outcome, not just the title)
- Why it matters (link to the originating doc or issue)
- Anything weird about the approach
- A clear definition of "done"

Cards without this context are blockers in disguise.

### Principle 3: Status is updated at start and end of work, not on demand

The standup ritual that co-located teams use ("what did you do, what are you doing") becomes a card movement habit in async teams: move the card to "Doing" when you start, leave a comment when you stop. The board *is* the standup.

### Principle 4: Blocked cards are loud

Every async team needs a hard rule: if you're blocked, the card moves to a "Blocked" column with a comment explaining what you need. Someone in a different time zone wakes up, sees it, and either unblocks you or reassigns. Without this rule, blockers sit silent for 12+ hours.

## A minimal async board structure

Don't over-design this. Five columns:

- **Backlog** — committed work, not started
- **This week** — pulled into the current week
- **Doing** — actively in progress (WIP limit: 1 per person)
- **Blocked** — waiting on something or someone
- **Done** — shipped this week (archived weekly)

That's it. No "QA," no "In Review," no "Stakeholder approval" column. Those are statuses *within* a card, not their own columns — your board breaks if you have 11 columns nobody can see at once.

## The weekly async rhythm

Replace daily standups with three async rituals:

**Monday — "What I'm working on" post**
Each person writes a short note in the team channel: top 1-3 cards they're tackling this week. Links to the cards. That's it.

**Daily — Card movement**
Move your cards as you work them. Drop short comments on blockers and decisions. The board reflects reality without anyone asking.

**Friday — Async demo / done summary**
Each person posts what shipped this week. Short Loom videos work well for visual changes. Written summary for everything else.

Total synchronous time: zero. Total visibility: higher than most co-located teams achieve.

## Notifications: the make-or-break setting

Async work falls apart if "the board updated" generates a Slack ping to everyone. It also falls apart if it pings *no one*. The right configuration:

- Card assigned to you → notify (DM)
- Card you're watching gets a comment → notify (DM)
- Card moved to Blocked → notify the assigner + the team channel
- Generic board changes → no notification

Pintask, Trello, and Linear all support this. Configure it on day one. Without it, the board becomes either noisy or invisible — both kill async work.

## The trust dividend

Done right, a public board does something that no amount of process can: it lets you stop checking on people. The work is visible. Progress is visible. Blockers are visible. Trust gets cheap because everyone is operating off the same observable reality.

The asynchronous productivity ceiling — where everyone's flow is protected and the team still ships — exists. It just requires a board you all trust, updated as a reflex, and the discipline to never let coordination drift back into chat.

That's the entire system. Pick a tool, write the rules down once, and enforce them for a month. By month two, you won't go back.`,
  },
  {
    slug: "notion-vs-trello-vs-pintask",
    title: "Notion vs. Trello vs. Pintask: An Honest 2026 Comparison",
    category: "Productivity",
    date: "April 27, 2026",
    readTime: "10 min read",
    excerpt:
      "Three popular tools, three very different philosophies. Here's a no-marketing comparison to help you pick the right one for your actual work.",
    content: `## The short version

If you want the answer without the reasoning:

- **Notion** — pick it if your work is mostly documents, with some lightweight task management on the side.
- **Trello** — pick it if you want the simplest possible Kanban board and don't need to extend it.
- **Pintask** — pick it if you want a Kanban board you can actually customize, with a free tier that's free forever and a $39 lifetime option.

The long version below explains *why* each pick is right for those cases — and what each tool is genuinely bad at.

## What each tool is really built for

### Notion: a docs platform that pretends to do tasks

Notion's core unit is a *page*. Everything else — databases, boards, calendars — is a view on top of a database of pages. This is elegant when your work is genuinely document-shaped (specs, wikis, meeting notes, project briefs). It's clunky when your work is task-shaped, because every "card" is really a full page that you have to click into.

**Best at:** team wikis, project documentation, mixed docs-and-light-tasks workflows.

**Worst at:** fast Kanban-style work. Notion's board view is functional but feels heavy compared to purpose-built boards. Drag-and-drop is slower. Mobile is awkward. Notifications are mediocre.

### Trello: the original Kanban board, frozen in time

Trello popularized Kanban for non-developers. Its strength is also its limit: it's a board with cards, and that's basically it. Power-Ups add features but most are now paywalled or rate-limited after Atlassian's acquisition. Pricing changed three times in two years.

**Best at:** a simple shared board for a small team that doesn't need anything custom.

**Worst at:** anything outside its default mental model. Want nested cards? Pay. Want time tracking? Pay or build a workaround. Want to script anything? Limited API. Want a board with 500+ cards? Performance suffers.

### Pintask: a hackable Kanban board for makers

Pintask started in 2014 with a specific bet: that customization shouldn't be a premium feature. The free plan includes unlimited boards, nested cards, file attachments, full keyboard shortcuts, and a real JavaScript API. Extensions (mirroring, hands-free time tracking, AI briefing) are optional paid add-ons or included in the $39 lifetime Co-Founder tier.

**Best at:** developers, indie makers, and small teams who want Trello's simplicity but with the option to extend or modify when they outgrow defaults.

**Worst at:** complex enterprise rollouts. There's no SSO yet. Reporting is basic compared to Linear or Jira.

## Head-to-head: the comparisons that actually matter

### Speed of daily use

For *opening the app, finding a card, moving it, closing the app* — the typical 90% use case — Trello and Pintask are roughly tied, both noticeably faster than Notion. Notion's page-based architecture adds clicks. If you do this 30 times a day, that adds up.

### Customization

- Notion: medium — you can build almost anything as long as it can be expressed as a database
- Trello: low — Power-Ups only, mostly paywalled
- Pintask: high — full JavaScript API, MongoDB browser access, extension marketplace

If "can I make it do X?" matters to you, Pintask wins by a wide margin.

### Collaboration

All three handle real-time collaboration well now. Notion has the richest commenting (because pages). Trello and Pintask both handle card-level comments and @mentions cleanly. For a team of 5-20, any of them work.

### Pricing honesty

- **Notion**: free for personal use, paid plans for teams ($8-15/user/month). Pricing has been stable.
- **Trello**: free plan exists but has been steadily restricted; paid plans $5-17.50/user/month. Pricing has changed multiple times in recent years.
- **Pintask**: free forever for everyone. $39 lifetime (Co-Founder) or $8/month grandfathered forever (Loyalty Club). Pricing won't go up for existing members.

Per-user pricing on collaborative tools punishes growing teams. Pintask's flat lifetime option is unusual and unusually friendly.

### Mobile

Notion mobile is slow but full-featured. Trello mobile is fast and adequate. Pintask mobile is fast (PWA-based, installs to home screen) and supports the same keyboard shortcuts.

## The honest verdict for common use cases

**You're a solo developer tracking personal tasks:**
Pintask. The free plan covers everything, keyboard shortcuts are first-class, and you can script it.

**You're a 3-person team writing a lot of docs:**
Notion. The docs-plus-tasks integration is the whole pitch and it works.

**You're a 10-person agency tracking client work:**
Trello if you want simple, Pintask if you want to add custom fields and workflows. Both can work.

**You're a software product team:**
Linear, honestly. None of the three above is purpose-built for sprint-based product work.

**You're migrating from Trello and hate the price hikes:**
Pintask. One-click import is built in, the board model maps directly, and the lifetime tier ends the pricing-treadmill problem.

## What to actually do next

Don't switch tools because of a blog post (this one included). Try one for two weeks with *real* work — not toy data. If it gets out of your way and you stop thinking about the tool, that's the one. If you find yourself wishing it were different, the next tool on your list deserves a shot.

The cost of picking "wrong" is much smaller than the cost of bouncing between tools every month. Commit, evaluate honestly, decide.`,
  },
  {
    slug: "getting-things-done-digital-setup",
    title: "Setting Up Getting Things Done (GTD) Digitally: A 2026 Playbook",
    category: "Tutorials",
    date: "April 24, 2026",
    readTime: "11 min read",
    excerpt:
      "David Allen's GTD method works beautifully on a Kanban board. Here's the exact list structure, contexts, and weekly review setup to run it digitally.",
    content: `## Why GTD still works after 20 years

David Allen published *Getting Things Done* in 2001. Two decades and a software revolution later, it's still the most-recommended productivity methodology on the planet. The core insight — your brain is for *having* ideas, not *holding* them — is timeless. The system is a way to externalize every commitment so your mind can relax.

What's changed is how it gets implemented. The original book assumes paper, file folders, and a tickler box. None of that is necessary now. A single Kanban board can run a full GTD system cleanly, with about an hour of setup.

## The five phases of GTD (the quick version)

1. **Capture** — everything that has your attention goes into an inbox, immediately.
2. **Clarify** — process each inbox item. Is it actionable? If yes, what's the next physical step?
3. **Organize** — file each clarified item into the right list (Next Actions, Projects, Waiting On, Someday).
4. **Reflect** — review the whole system weekly to keep it trusted.
5. **Engage** — do the work, picking from the right list at the right moment.

A Kanban board can hold all five.

## The board structure

Set up one board with these lists (or boards-within-boards, if your tool supports nesting):

### Inbox
Single column. Every new item lands here, no exceptions. Quick-add shortcuts on every device feed it. You process Inbox to zero at least once a day.

### Next Actions (by context)
This replaces "Next Actions" as a single list with one column per context:
- \`@home\`
- \`@office\`
- \`@phone\`
- \`@errand\`
- \`@computer\`
- \`@15min\` (anything that takes 15 minutes or less)

Or use labels instead of columns if you prefer fewer columns. Either works.

### Projects
Anything requiring more than one action is a project. Each project is a single card with a checklist of sub-actions. The card title is the *outcome*, not the activity: "Website redesign launched" not "Work on website."

When you pull a next action from a project, you put it on the Next Actions board with a link back to the project card.

### Waiting On
Things you've delegated or are expecting from others. Each card includes: who, what, and when you'll follow up if you haven't heard back.

### Someday / Maybe
Ideas you might want to do later. Restaurants to try. Books to read. Side project concepts. This list should grow and shrink — most items should eventually be deleted or promoted.

### Reference (separate board or area)
Things you don't need to *do* but need to *find later*: passwords, account info, recipes, notes. This isn't really a Kanban use case — Notion, Obsidian, or Apple Notes is a better home for reference material.

## The capture habit

Capture is the foundation. Everything else falls apart if you don't capture instantly. Setup:

- **Phone**: a home-screen shortcut to your task tool's "Quick Add" — one tap, type, done. iOS Shortcuts or Android equivalents make this trivial.
- **Computer**: a global keyboard shortcut for the same. Pintask supports this natively; Raycast can layer one on top of any tool.
- **Paper / brain dump**: keep a small notebook by your desk for moments away from devices. Move items to digital inbox during the next process session.

Goal: from "I just thought of something" to "it's captured" in under 5 seconds.

## The clarify pass

Twice a day (mid-morning, end of day), open Inbox and process every item:

**Is it actionable?**
- No → trash, file to reference, or move to Someday.
- Yes → continue.

**Will it take less than 2 minutes?**
- Yes → do it right now. Don't file it.
- No → continue.

**Is it a single action or a project?**
- Single → move to the right Next Actions context.
- Project → create a project card, define the next action, file the next action.

**Am I the right person to do this?**
- No → delegate, then create a Waiting On card.
- Yes → it's now in your Next Actions list.

This pass takes 5-10 minutes if you do it twice a day. It takes 45 minutes if you let inbox grow for a week.

## The weekly review

Friday afternoon, 30-45 minutes:

1. **Empty all inboxes** — email, task, voice notes, paper notebook.
2. **Re-process anything that landed during the week but is stale.**
3. **Review every project** — does each one have a clear next action? Does it still matter?
4. **Review Waiting On** — nudge anyone you haven't heard from in over a week.
5. **Review Someday** — promote anything that's now ripe, archive what's gone cold.
6. **Look at the next 2 weeks of calendar** — anything need prep?
7. **Pick three priorities for next week** — write them somewhere visible.

This is the keystone habit. Skip it and the system rots within a month. Do it consistently and the system gets *more* trustworthy over time, not less.

## The engage moment

When you sit down to work, GTD says: pick a next action based on four criteria, in order:

1. **Context** — what can I do where I am? (Filter by \`@office\` if you're at the office.)
2. **Time available** — how long do I have? (Use \`@15min\` for short windows.)
3. **Energy** — am I sharp or fried? (Hard deep work in the morning; admin in the afternoon slump.)
4. **Priority** — among everything I *could* do, what matters most?

Most people skip 1-3 and go straight to priority, which is why they end up trying to do deep work in 10-minute gaps and resenting their list. The filtering is the productivity.

## A 60-minute setup plan

1. Pick a Kanban tool (Pintask works well; so does Trello or anything similar). — 5 min
2. Create the board with the lists above. — 10 min
3. Brain dump: write down every open loop in your head, one per card, into Inbox. — 20 min
4. Process the inbox: clarify each item into the right list. — 20 min
5. Schedule a recurring 30-minute Friday weekly review. — 5 min

You'll end with a working GTD setup that, if you maintain it, will reduce mental load measurably within two weeks. The first weekly review will be the moment it clicks — when you realize your brain has finally let go of trying to remember everything.

That release is the entire point of GTD. The system isn't the win. The trust is.`,
  },
];

export const getPostBySlug = (slug: string) => blogPosts.find((p) => p.slug === slug);

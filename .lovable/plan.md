

## Pintask-Style Task Tracker — Full Build Plan

### Overview
A personal Kanban-based task management app with time tracking, link attachments, and project organization. Built with Supabase (via Lovable Cloud) for data persistence and authentication.

---

### 1. Authentication
- Email/password signup & login
- Simple profile (display name, avatar)

### 2. Projects & Boards
- Users can create **projects**, each containing one or more **Kanban boards**
- Projects have a name, description, and optional color/icon
- Ability to attach **links** (URLs) to projects

### 3. Kanban Board
- Default columns: To Do, In Progress, Done (customizable)
- **Drag-and-drop** cards between columns and reorder within columns
- Add, rename, and delete columns

### 4. Task Cards
- Title, description, due date, priority label
- Attach **links/URLs** to individual tasks
- Color labels/tags for categorization
- Card detail view in a slide-out panel or modal

### 5. Time Tracking
- Start/stop timer on any task card
- Log total time spent per task
- View time summary per project and per task

### 6. Dashboard & Navigation
- Sidebar with project list
- Dashboard showing recent tasks, active timers, and project overview
- Search/filter tasks across projects

### 7. Design & UX
- Clean, modern UI inspired by Pintask/Trello
- Responsive layout (desktop-first, mobile-friendly)
- Light/dark mode toggle

### 8. Database (Lovable Cloud / Supabase)
- Tables: profiles, projects, boards, columns, tasks, task_links, time_entries
- Row-level security so each user only sees their own data


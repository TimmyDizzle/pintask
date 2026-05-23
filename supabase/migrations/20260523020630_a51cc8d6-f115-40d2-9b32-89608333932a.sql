create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  function_name text not null,
  provider text not null,
  model text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  cost_micro_usd bigint not null default 0,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create index ai_usage_function_created_idx on public.ai_usage (function_name, created_at desc);
create index ai_usage_created_idx on public.ai_usage (created_at desc);

alter table public.ai_usage enable row level security;

create policy "Admins can read ai usage"
  on public.ai_usage for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
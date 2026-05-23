// Shared AI usage logging + cost estimation for Lovable AI gateway.
// All edge functions that call ai.gateway.lovable.dev should log here so
// /admin/ai-eval has a complete picture of spend by function and provider.
//
// Prices are in USD per 1M tokens (chat & embeddings) or USD per image
// (image models). Update as Lovable AI pricing changes.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type ChatPricing = { kind: "tokens"; in: number; out: number };
export type ImagePricing = { kind: "image"; per: number }; // USD per output image
export type ModelPricing = ChatPricing | ImagePricing;

// Single source of truth.
export const PRICING: Record<string, ModelPricing> = {
  // Chat / reasoning (USD per 1M tokens)
  "google/gemini-3-flash-preview": { kind: "tokens", in: 0.075, out: 0.30 },
  "google/gemini-2.5-flash": { kind: "tokens", in: 0.075, out: 0.30 },
  "google/gemini-2.5-flash-lite": { kind: "tokens", in: 0.04, out: 0.15 },
  "google/gemini-2.5-pro": { kind: "tokens", in: 1.25, out: 5.00 },
  "openai/gpt-5-mini": { kind: "tokens", in: 0.25, out: 2.00 },
  "openai/gpt-5": { kind: "tokens", in: 1.25, out: 10.00 },
  "openai/gpt-5-nano": { kind: "tokens", in: 0.05, out: 0.40 },

  // Embeddings (USD per 1M tokens, completion always 0)
  "openai/text-embedding-3-small": { kind: "tokens", in: 0.02, out: 0 },
  "google/gemini-embedding-001": { kind: "tokens", in: 0.15, out: 0 },

  // Image generation (USD per output image)
  "google/gemini-2.5-flash-image": { kind: "image", per: 0.039 },
  "google/gemini-3-pro-image-preview": { kind: "image", per: 0.12 },
};

/**
 * Returns the estimated cost in micro-USD (1 USD = 1_000_000 micro-USD).
 * For token-priced models, pass prompt/completion token counts.
 * For image-priced models, pass `images` (number of output images, default 1).
 */
export function estimateMicroUsd(
  model: string,
  promptTokens: number,
  completionTokens: number,
  images = 0,
): number {
  const p = PRICING[model];
  if (!p) return 0;
  if (p.kind === "tokens") {
    // tokens × (USD per 1M tokens) = micro-USD
    return Math.round(promptTokens * p.in + completionTokens * p.out);
  }
  // image-priced: per * 1_000_000 micro-USD per image
  const n = images > 0 ? images : 1;
  return Math.round(n * p.per * 1_000_000);
}

export type UsageInput = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

/**
 * Fire-and-forget insert into ai_usage. Swallows errors so a logging
 * failure never breaks the parent AI request.
 *
 * `userId` may be null for server-to-server / scheduled callers.
 */
export async function logUsage(opts: {
  userId: string | null;
  functionName: string;
  provider: string; // e.g. "lovable"
  model: string;
  usage?: UsageInput;
  latencyMs: number;
  images?: number; // for image-priced models
}): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const promptTokens = opts.usage?.prompt_tokens ?? 0;
    const completionTokens = opts.usage?.completion_tokens ?? 0;
    const totalTokens =
      opts.usage?.total_tokens ?? promptTokens + completionTokens;
    const admin = createClient(url, key);
    await admin.from("ai_usage").insert({
      user_id: opts.userId,
      function_name: opts.functionName,
      provider: opts.provider,
      model: opts.model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      cost_micro_usd: estimateMicroUsd(
        opts.model,
        promptTokens,
        completionTokens,
        opts.images ?? 0,
      ),
      latency_ms: opts.latencyMs,
    });
  } catch (e) {
    console.error("logUsage failed:", e);
  }
}

/** Best-effort extraction of the auth'd user id from an Authorization header. */
export async function getUserIdFromAuthHeader(
  authHeader: string | null,
): Promise<string | null> {
  if (!authHeader) return null;
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    if (!url || !anon) return null;
    const sb = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data } = await sb.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

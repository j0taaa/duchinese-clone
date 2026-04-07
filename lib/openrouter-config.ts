/**
 * Server-side OpenRouter settings. Keys must never be exposed to the client.
 */
export const DEFAULT_OPENROUTER_CHAT_URL =
  "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_OPENROUTER_MODEL = "google/gemini-3.1-flash-lite-preview";

export function getOpenRouterChatUrl(): string {
  const url = process.env.OPENROUTER_CHAT_URL?.trim();
  return url && url.length > 0 ? url : DEFAULT_OPENROUTER_CHAT_URL;
}

export function getOpenRouterModel(): string {
  const model = process.env.OPENROUTER_MODEL?.trim();
  return model && model.length > 0 ? model : DEFAULT_OPENROUTER_MODEL;
}

/** Optional cheaper model for short topic-idea calls; falls back to main model. */
export function getOpenRouterIdeaModel(): string {
  const idea = process.env.OPENROUTER_IDEA_MODEL?.trim();
  return idea && idea.length > 0 ? idea : getOpenRouterModel();
}

export function requireOpenRouterApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured on the server.");
  }
  return key;
}

export function getOpenRouterAppHeaders(): Record<string, string> {
  const referer =
    process.env.OPENROUTER_HTTP_REFERER?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "";
  const title = process.env.OPENROUTER_APP_TITLE?.trim() || "HanziLane";

  const headers: Record<string, string> = {};
  if (referer) {
    headers["HTTP-Referer"] = referer;
  }
  headers["X-Title"] = title;
  return headers;
}

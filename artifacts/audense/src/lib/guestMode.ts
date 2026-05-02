/* ─── Guest-mode tracking helpers ────────────────────────────────────
 * All state lives in localStorage so it survives page reloads.
 * Keys are intentionally prefixed so they never clash with session data.
 * ─────────────────────────────────────────────────────────────────── */

const GUEST_CHAT_COUNT_KEY  = "audense-guest-chat-count";
const HAS_GUEST_RESEARCH_KEY = "audense-has-created-guest-research";
const GUEST_MIGRATED_KEY     = "audense-guest-migrated";
const SOFT_SEEN_KEY          = "audense-soft-prompt-seen"; // e.g. "3,6"

/* ─── Chat counter ────────────────────────────────────────────────── */

export function getGuestChatCount(): number {
  try { return parseInt(localStorage.getItem(GUEST_CHAT_COUNT_KEY) ?? "0", 10) || 0; }
  catch { return 0; }
}

/** Increments counter and returns the new value. */
export function incGuestChatCount(): number {
  const next = getGuestChatCount() + 1;
  try { localStorage.setItem(GUEST_CHAT_COUNT_KEY, String(next)); } catch {}
  return next;
}

export function resetGuestChatCount(): void {
  try { localStorage.removeItem(GUEST_CHAT_COUNT_KEY); } catch {}
}

/* ─── Guest research flag ─────────────────────────────────────────── */

export function hasGuestResearch(): boolean {
  try { return localStorage.getItem(HAS_GUEST_RESEARCH_KEY) === "1"; }
  catch { return false; }
}

export function setHasGuestResearch(): void {
  try { localStorage.setItem(HAS_GUEST_RESEARCH_KEY, "1"); } catch {}
}

export function clearGuestResearch(): void {
  try {
    localStorage.removeItem(HAS_GUEST_RESEARCH_KEY);
    localStorage.removeItem(GUEST_CHAT_COUNT_KEY);
  } catch {}
}

/* ─── Guest migration tracking ────────────────────────────────────── */

export function isGuestMigrated(sessionId: string): boolean {
  try { return localStorage.getItem(GUEST_MIGRATED_KEY) === sessionId; }
  catch { return false; }
}

export function setGuestMigrated(sessionId: string): void {
  try { localStorage.setItem(GUEST_MIGRATED_KEY, sessionId); } catch {}
}

/* ─── Soft-prompt dismissal tracking ─────────────────────────────── */

function getSeenSet(): Set<number> {
  try {
    const raw = localStorage.getItem(SOFT_SEEN_KEY) ?? "";
    return new Set(raw.split(",").map(Number).filter(Boolean));
  } catch { return new Set(); }
}

export function getSoftPromptSeenAt(threshold: number): boolean {
  return getSeenSet().has(threshold);
}

export function setSoftPromptSeenAt(threshold: number): void {
  try {
    const s = getSeenSet();
    s.add(threshold);
    localStorage.setItem(SOFT_SEEN_KEY, [...s].join(","));
  } catch {}
}

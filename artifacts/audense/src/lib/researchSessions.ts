import type { AudienceMapResult } from "./audienceMap";

/* ─── Types ──────────────────────────────────────────────────────── */

export interface StoredMessage {
  id: number;
  role: "user" | "ai" | "confirm" | "success";
  text: string;
  proposedMap?: AudienceMapResult;
}

export interface ResearchSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  onboardingData: Record<string, string>;
  audienceMap: AudienceMapResult;
  chatMessages: StoredMessage[];
}

/* ─── Keys ───────────────────────────────────────────────────────── */

const SESSIONS_KEY  = "audense-research-sessions";
const ACTIVE_ID_KEY = "audense-active-session-id";
const MAX_SESSIONS  = 20;

/* ─── ID / title helpers ─────────────────────────────────────────── */

export function newSessionId(): string {
  try { return crypto.randomUUID(); } catch {}
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function makeSessionTitle(ob: Record<string, string>): string {
  const idea = (ob.productIdea ?? "").trim();
  if (!idea) return "Untitled Research";
  return idea.length > 40 ? idea.slice(0, 37) + "…" : idea;
}

/* ─── Load / save ────────────────────────────────────────────────── */

export function loadSessions(): ResearchSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) return JSON.parse(raw) as ResearchSession[];
  } catch {}
  return [];
}

export function saveSessions(sessions: ResearchSession[]): void {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch {}
}

/* ─── Active session ID ──────────────────────────────────────────── */

export function getActiveSessionId(): string | null {
  try { return localStorage.getItem(ACTIVE_ID_KEY); } catch { return null; }
}

export function setActiveSessionId(id: string): void {
  try { localStorage.setItem(ACTIVE_ID_KEY, id); } catch {}
}

/* ─── Session lookup ─────────────────────────────────────────────── */

export function getActiveSession(): ResearchSession | null {
  const id = getActiveSessionId();
  if (!id) return null;
  return loadSessions().find((s) => s.id === id) ?? null;
}

/* ─── Upsert (add new or update existing) ────────────────────────── */

export function upsertSession(session: ResearchSession): void {
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
    if (sessions.length > MAX_SESSIONS) sessions.splice(MAX_SESSIONS);
  }
  saveSessions(sessions);
}

/* ─── Patch the active session in-place ──────────────────────────── */

export function updateActiveSession(
  patch: Partial<Pick<ResearchSession, "chatMessages" | "audienceMap">>,
): void {
  const id = getActiveSessionId();
  if (!id) return;
  const sessions = loadSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  sessions[idx] = { ...sessions[idx], ...patch, updatedAt: new Date().toISOString() };
  saveSessions(sessions);
}

/* ─── Compat-key cleanup ─────────────────────────────────────────────
   Single-session compat keys ("audense-audience-map", "audense-chat-messages",
   "audense_onboarding") were originally the source of truth before sessions
   existed. They're now downstream caches that follow the active session.
   When starting a new session or switching users, we must wipe them first so
   stale data from a previous research never bleeds into the next one. */
export function clearCompatKeys(): void {
  try {
    localStorage.removeItem("audense-audience-map");
    localStorage.removeItem("audense-chat-messages");
    localStorage.removeItem("audense_onboarding");
  } catch {}
}

export function clearActiveSessionId(): void {
  try { localStorage.removeItem(ACTIVE_ID_KEY); } catch {}
}

/* ─── Strict per-id hydration — no global fallback ────────────────── */
export function hydrateSession(id: string): ResearchSession | null {
  if (!id) return null;
  return loadSessions().find((s) => s.id === id) ?? null;
}

/* ─── Centralised "start fresh research" flow ─────────────────────── */
export function createFreshResearchSession(params: {
  onboardingData: Record<string, string>;
  audienceMap: import("./audienceMap").AudienceMapResult;
}): ResearchSession {
  /* Wipe stale compat keys *before* writing the new session so any reader
     that falls back to compat (legacy code paths) cannot see leftover data
     from the previous research. */
  clearCompatKeys();

  const id = newSessionId();
  const now = new Date().toISOString();
  const session: ResearchSession = {
    id,
    title: makeSessionTitle(params.onboardingData),
    createdAt: now,
    updatedAt: now,
    onboardingData: params.onboardingData,
    audienceMap: params.audienceMap,
    chatMessages: [],
  };
  upsertSession(session);
  setActiveSessionId(id);

  /* Re-write compat keys to match the new session — this keeps any legacy
     reader pointing at the *current* session's data, not a previous one. */
  try {
    localStorage.setItem("audense_onboarding", JSON.stringify(params.onboardingData));
    localStorage.setItem("audense-audience-map", JSON.stringify(params.audienceMap));
  } catch {}

  return session;
}

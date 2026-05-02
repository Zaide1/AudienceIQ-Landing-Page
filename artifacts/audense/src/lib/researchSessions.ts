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

/**
 * Supabase-backed persistence for research sessions.
 * All functions are no-ops / return null if Supabase is not configured or user is not signed in.
 * The caller falls back to localStorage on any failure.
 */
import { supabase } from "./supabase";
import type { AudienceMapResult } from "./audienceMap";
import type { ResearchSession, StoredMessage } from "./researchSessions";

/* ─── Save / upsert a full session ──────────────────────────────── */
export async function sbSaveSession(session: ResearchSession): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error: sessErr } = await supabase
      .from("research_sessions")
      .upsert({
        id:              session.id,
        user_id:         user.id,
        title:           session.title,
        category:        session.onboardingData?.finalCategory ?? session.onboardingData?.category ?? null,
        region:          session.onboardingData?.finalRegion   ?? session.onboardingData?.region   ?? null,
        onboarding_data: session.onboardingData,
        updated_at:      session.updatedAt,
        created_at:      session.createdAt,
      }, { onConflict: "id" });
    if (sessErr) { console.warn("[sb] session upsert failed", sessErr.message); return false; }

    const { error: mapErr } = await supabase
      .from("audience_maps")
      .upsert({
        session_id:        session.id,
        audience_map_json: session.audienceMap,
        source_mode:       session.audienceMap.evidenceSummary?.sourceMode ?? "ai_hypothesis",
        updated_at:        new Date().toISOString(),
      }, { onConflict: "session_id" });
    if (mapErr) console.warn("[sb] map upsert failed", mapErr.message);

    if (session.chatMessages.length > 0) {
      await supabase.from("chat_messages").delete().eq("session_id", session.id);
      const rows = session.chatMessages
        .filter((m) => m.role === "user" || m.role === "ai")
        .map((m) => ({
          session_id: session.id,
          role:       m.role === "ai" ? "ai" : "user",
          content:    m.text,
        }));
      if (rows.length > 0) {
        const { error: chatErr } = await supabase.from("chat_messages").insert(rows);
        if (chatErr) console.warn("[sb] chat insert failed", chatErr.message);
      }
    }
    return true;
  } catch (e) { console.warn("[sb] sbSaveSession error", e); return false; }
}

/* ─── Append a single chat message (efficient for real-time) ─────── */
export async function sbAppendMessage(
  sessionId: string,
  msg: StoredMessage,
): Promise<boolean> {
  if (!supabase) return false;
  if (msg.role !== "user" && msg.role !== "ai") return true;
  try {
    const { error } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role:       msg.role === "ai" ? "ai" : "user",
      content:    msg.text,
    });
    if (error) { console.warn("[sb] append message failed", error.message); return false; }
    return true;
  } catch (e) { console.warn("[sb] sbAppendMessage error", e); return false; }
}

/* ─── Update the audience map for a session ─────────────────────── */
export async function sbUpdateMap(
  sessionId: string,
  map: AudienceMapResult,
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("audience_maps")
      .upsert({
        session_id:        sessionId,
        audience_map_json: map,
        source_mode:       map.evidenceSummary?.sourceMode ?? "ai_hypothesis",
        updated_at:        now,
      }, { onConflict: "session_id" });
    await supabase.from("research_sessions").update({ updated_at: now }).eq("id", sessionId);
    if (error) { console.warn("[sb] map update failed", error.message); return false; }
    return true;
  } catch (e) { console.warn("[sb] sbUpdateMap error", e); return false; }
}

/* ─── Load session list with audience map data for display ──────── */
export async function sbLoadSessionList(): Promise<ResearchSession[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("research_sessions")
      .select(`
        id, title, category, region, updated_at, created_at, onboarding_data,
        audience_maps ( audience_map_json )
      `)
      .order("updated_at", { ascending: false })
      .limit(20);

    if (error) { console.warn("[sb] load session list failed", error.message); return null; }

    return (data ?? []).map((row) => {
      const mapRows = row.audience_maps as Array<{ audience_map_json: AudienceMapResult }> | null;
      const audienceMap = mapRows?.[0]?.audience_map_json ?? null;
      const od: Record<string, string> = {
        ...(row.onboarding_data as Record<string, string> ?? {}),
        finalCategory: row.category ?? "",
        finalRegion:   row.region   ?? "",
      };
      return {
        id:             row.id as string,
        title:          row.title as string,
        createdAt:      row.created_at as string,
        updatedAt:      row.updated_at as string,
        onboardingData: od,
        audienceMap:    audienceMap as AudienceMapResult,
        chatMessages:   [],
      } satisfies ResearchSession;
    });
  } catch (e) { console.warn("[sb] sbLoadSessionList error", e); return null; }
}

/* ─── Load a full session (map + chat) ──────────────────────────── */
export async function sbLoadFullSession(sessionId: string): Promise<ResearchSession | null> {
  if (!supabase) return null;
  try {
    const { data: sessRow, error: sessErr } = await supabase
      .from("research_sessions")
      .select("id, title, category, region, onboarding_data, created_at, updated_at")
      .eq("id", sessionId)
      .single();
    if (sessErr || !sessRow) { console.warn("[sb] load session failed", sessErr?.message); return null; }

    const { data: mapRow, error: mapErr } = await supabase
      .from("audience_maps")
      .select("audience_map_json")
      .eq("session_id", sessionId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
    if (mapErr || !mapRow) { console.warn("[sb] load map failed", mapErr?.message); return null; }

    const { data: msgs, error: chatErr } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (chatErr) console.warn("[sb] load chat failed", chatErr?.message);

    const chatMessages: StoredMessage[] = (msgs ?? []).map((m, i) => ({
      id:   i + 100,
      role: m.role === "user" ? "user" : "ai",
      text: m.content as string,
    }));

    const od: Record<string, string> = {
      ...(sessRow.onboarding_data as Record<string, string> ?? {}),
      finalCategory: sessRow.category ?? "",
      finalRegion:   sessRow.region   ?? "",
    };

    return {
      id:             sessRow.id as string,
      title:          sessRow.title as string,
      createdAt:      sessRow.created_at as string,
      updatedAt:      sessRow.updated_at as string,
      onboardingData: od,
      audienceMap:    mapRow.audience_map_json as AudienceMapResult,
      chatMessages,
    };
  } catch (e) { console.warn("[sb] sbLoadFullSession error", e); return null; }
}

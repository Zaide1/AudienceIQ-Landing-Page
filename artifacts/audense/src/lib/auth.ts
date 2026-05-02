import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

/* ─── Convert Supabase user to AuthUser ──────────────────────────── */
function toAuthUser(user: { id: string; email?: string | null } | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

/* ─── Sign up ────────────────────────────────────────────────────── */
export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: "Supabase not configured" };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) return { user: null, error: error.message };
  return { user: toAuthUser(data.user), error: null };
}

/* ─── Sign in ────────────────────────────────────────────────────── */
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (!supabase) return { user: null, error: "Supabase not configured" };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  return { user: toAuthUser(data.user), error: null };
}

/* ─── Sign out ───────────────────────────────────────────────────── */
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/* ─── Get current user ───────────────────────────────────────────── */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return toAuthUser(data.user);
}

/* ─── Subscribe to auth changes ──────────────────────────────────── */
export function onAuthChange(cb: (user: AuthUser | null) => void): () => void {
  if (!supabase) { cb(null); return () => {}; }
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(toAuthUser(session?.user ?? null));
  });
  return () => subscription.unsubscribe();
}

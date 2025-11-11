import type { User } from "@supabase/supabase-js";
import type { AppUser } from "@/types/auth";
import { getSupabaseServerComponentClient } from "@/lib/supabase-clients";

export type SessionUser = AppUser;

const mapSupabaseUser = (user: User): AppUser => {
  const fallbackEmail = user.user_metadata?.email || `${user.id}@app.local`;
  return {
    id: user.id,
    email: user.email ?? fallbackEmail,
    createdAt: user.created_at ?? new Date().toISOString(),
  };
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await getSupabaseServerComponentClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return mapSupabaseUser(data.user);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

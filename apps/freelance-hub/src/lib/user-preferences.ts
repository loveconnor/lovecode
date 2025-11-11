import type { SupabaseDBClient } from "@/lib/supabase-clients";

const memorySymbol = Symbol.for("fh_user_preferences");
type MemoryStore = Map<string, UserPreferences>;
const globalStore = globalThis as typeof globalThis & {
  [memorySymbol]?: MemoryStore;
};
if (!globalStore[memorySymbol]) {
  globalStore[memorySymbol] = new Map<string, UserPreferences>();
}
let memoryStore = globalStore[memorySymbol];
if (!memoryStore) {
  memoryStore = new Map<string, UserPreferences>();
  globalStore[memorySymbol] = memoryStore;
}

export type UserPreferences = {
  useDemoData?: boolean;
};

type MaybeSupabase = SupabaseDBClient | null | undefined;

async function readFromSupabase(
  userId: string,
  supabase?: MaybeSupabase,
): Promise<UserPreferences | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_preferences")
    .select("use_demo_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase read error (user_preferences)", error);
    return null;
  }

  if (!data) return {};

  return {
    useDemoData: Boolean(data.use_demo_data),
  };
}

async function writeToSupabase(
  userId: string,
  preferences: UserPreferences,
  supabase?: MaybeSupabase,
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from("user_preferences").upsert({
    user_id: userId,
    use_demo_data: preferences.useDemoData ?? false,
  });

  if (error) {
    console.error("Supabase upsert error (user_preferences)", error);
    return false;
  }

  return true;
}

export async function getUserPreferences(
  userId: string,
  supabase?: MaybeSupabase,
): Promise<UserPreferences> {
  const supabasePrefs = await readFromSupabase(userId, supabase);
  if (supabasePrefs) {
    memoryStore.set(userId, supabasePrefs);
    return supabasePrefs;
  }

  return memoryStore.get(userId) ?? {};
}

export async function saveUserPreferences(
  userId: string,
  preferences: UserPreferences,
  supabase?: MaybeSupabase,
): Promise<void> {
  const current = await getUserPreferences(userId, supabase);
  const next = {
    ...current,
    ...preferences,
  };

  const saved = await writeToSupabase(userId, next, supabase);
  if (!saved) {
    memoryStore.set(userId, next);
  }
}

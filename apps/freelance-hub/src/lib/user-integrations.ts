import type { SupabaseDBClient } from "@/lib/supabase-clients";
import type { IntegrationProviderId } from "@/lib/integration-providers";

const memorySymbol = Symbol.for("fh_user_integrations");
type MemoryStore = Map<string, UserIntegrations>;
const globalStore = globalThis as typeof globalThis & {
  [memorySymbol]?: MemoryStore;
};
if (!globalStore[memorySymbol]) {
  globalStore[memorySymbol] = new Map();
}
let memoryStore = globalStore[memorySymbol];
if (!memoryStore) {
  memoryStore = new Map<string, UserIntegrations>();
  globalStore[memorySymbol] = memoryStore;
}

export type UserIntegrations = Record<
  IntegrationProviderId,
  Record<string, string>
>;

type MaybeSupabase = SupabaseDBClient | null | undefined;

async function readFromSupabase(
  userId: string,
  supabase?: MaybeSupabase,
): Promise<UserIntegrations | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_integrations")
    .select("provider_id,secrets")
    .eq("user_id", userId);

  if (error) {
    console.error("Supabase read error (user_integrations)", error);
    return null;
  }

  const integrations: UserIntegrations = {};
  for (const row of data || []) {
    const providerId = row.provider_id as IntegrationProviderId;
    integrations[providerId] = (row.secrets || {}) as Record<string, string>;
  }
  return integrations;
}

async function writeToSupabase(
  userId: string,
  providerId: IntegrationProviderId,
  secrets: Record<string, string>,
  supabase?: MaybeSupabase,
) {
  if (!supabase) return false;

  const { error } = await supabase.from("user_integrations").upsert({
    user_id: userId,
    provider_id: providerId,
    secrets,
  });
  if (error) {
    console.error("Supabase upsert error (user_integrations)", error);
    return false;
  }
  return true;
}

async function deleteFromSupabase(
  userId: string,
  providerId: IntegrationProviderId,
  supabase?: MaybeSupabase,
) {
  if (!supabase) return false;
  const { error } = await supabase
    .from("user_integrations")
    .delete()
    .eq("user_id", userId)
    .eq("provider_id", providerId);
  if (error) {
    console.error("Supabase delete error (user_integrations)", error);
    return false;
  }
  return true;
}

export async function getUserIntegrations(
  userId: string,
  supabase?: MaybeSupabase,
): Promise<UserIntegrations> {
  const fromSupabase = await readFromSupabase(userId, supabase);
  if (fromSupabase) {
    memoryStore.set(userId, fromSupabase);
    return fromSupabase;
  }

  return memoryStore.get(userId) ?? ({} as UserIntegrations);
}

export async function saveUserIntegration(
  userId: string,
  providerId: IntegrationProviderId,
  values: Record<string, string>,
  supabase?: MaybeSupabase,
): Promise<void> {
  const allIntegrations = await getUserIntegrations(userId, supabase);
  allIntegrations[providerId] = values;

  const saved = await writeToSupabase(userId, providerId, values, supabase);
  if (!saved) {
    memoryStore.set(userId, allIntegrations);
  }
}

export async function deleteUserIntegration(
  userId: string,
  providerId: IntegrationProviderId,
  supabase?: MaybeSupabase,
): Promise<void> {
  const allIntegrations = await getUserIntegrations(userId, supabase);
  if (allIntegrations[providerId]) {
    delete allIntegrations[providerId];
    const removed = await deleteFromSupabase(userId, providerId, supabase);
    if (!removed) {
      memoryStore.set(userId, allIntegrations);
    }
  }
}

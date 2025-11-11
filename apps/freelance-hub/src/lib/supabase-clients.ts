import { cookies } from "next/headers";
import {
  createRouteHandlerClient,
  createServerComponentClient,
  type SupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export type SupabaseDBClient = SupabaseClient<Database>;

export async function getSupabaseServerComponentClient() {
  const cookieStore = await cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

export async function getSupabaseRouteHandlerClient() {
  const cookieStore = await cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
}

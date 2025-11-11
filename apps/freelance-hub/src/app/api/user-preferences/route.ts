import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase-clients";
import {
  getUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from "@/lib/user-preferences";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseRouteHandlerClient();
  const preferences = await getUserPreferences(user.id, supabase);
  return NextResponse.json(preferences);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UserPreferences;
  const supabase = await getSupabaseRouteHandlerClient();
  await saveUserPreferences(user.id, body, supabase);
  return NextResponse.json(body);
}

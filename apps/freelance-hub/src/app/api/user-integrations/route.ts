import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase-clients";
import {
  INTEGRATION_PROVIDER_MAP,
  INTEGRATION_PROVIDERS,
  type IntegrationProviderId,
} from "@/lib/integration-providers";
import {
  deleteUserIntegration,
  getUserIntegrations,
  saveUserIntegration,
} from "@/lib/user-integrations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseRouteHandlerClient();
  const stored = await getUserIntegrations(user.id, supabase);
  const providers = INTEGRATION_PROVIDERS.map((provider) => ({
    id: provider.id,
    name: provider.name,
    description: provider.description,
    connected: Boolean(stored[provider.id]),
  }));

  return NextResponse.json({ providers });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseRouteHandlerClient();
  const body = await request.json();
  const providerId = body.providerId as IntegrationProviderId | undefined;
  const values = body.values as Record<string, string | undefined>;

  if (!providerId || !values) {
    return NextResponse.json(
      { error: "providerId and values are required" },
      { status: 400 },
    );
  }

  const provider = INTEGRATION_PROVIDER_MAP[providerId];
  if (!provider) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  const sanitized: Record<string, string> = {};
  for (const field of provider.fields) {
    const value = values[field.id];
    if (!value && field.required !== false) {
      return NextResponse.json(
        { error: `Missing value for ${field.label}` },
        { status: 400 },
      );
    }
    if (value) {
      sanitized[field.id] = String(value);
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one field" },
      { status: 400 },
    );
  }

  await saveUserIntegration(user.id, providerId, sanitized, supabase);
  return NextResponse.json({ providerId, connected: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseRouteHandlerClient();
  const body = await request.json();
  const providerId = body.providerId as IntegrationProviderId | undefined;
  if (!providerId) {
    return NextResponse.json(
      { error: "providerId is required" },
      { status: 400 },
    );
  }

  await deleteUserIntegration(user.id, providerId, supabase);
  return NextResponse.json({ providerId, connected: false });
}

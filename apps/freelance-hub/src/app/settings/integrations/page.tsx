import { redirect } from "next/navigation";
import { DemoToggle } from "@/components/settings/demo-toggle";
import { IntegrationManager } from "@/components/settings/integration-manager";
import { SettingsShell } from "@/components/settings/settings-shell";
import type { IntegrationProviderWithStatus } from "@/components/settings/types";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseServerComponentClient } from "@/lib/supabase-clients";
import { INTEGRATION_PROVIDERS } from "@/lib/integration-providers";
import { getUserIntegrations } from "@/lib/user-integrations";
import { getUserPreferences } from "@/lib/user-preferences";

export const dynamic = "force-dynamic";

export default async function IntegrationsSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/settings/integrations");
  }

  const supabase = await getSupabaseServerComponentClient();
  const storedIntegrations = await getUserIntegrations(user.id, supabase);
  const preferences = await getUserPreferences(user.id, supabase);
  const providersWithStatus: IntegrationProviderWithStatus[] =
    INTEGRATION_PROVIDERS.map((provider) => ({
      ...provider,
      connected: Boolean(storedIntegrations[provider.id]),
    }));

  return (
    <SettingsShell userEmail={user.email}>
      <section>
        <h2 className="text-base font-semibold">Integration preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle demo data on or off before connecting real credentials.
        </p>
        <div className="mt-6 rounded-lg border p-6">
          <DemoToggle defaultChecked={Boolean(preferences.useDemoData)} />
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold">Connected applications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste per-provider keys or tokens. Values are encrypted in Supabase
          and never shown again.
        </p>
        <div className="mt-6 space-y-6">
          <IntegrationManager providers={providersWithStatus} />
        </div>
      </section>
    </SettingsShell>
  );
}

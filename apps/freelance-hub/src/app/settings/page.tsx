import { redirect } from "next/navigation";
import { DemoToggle } from "@/components/settings/demo-toggle";
import { SettingsShell } from "@/components/settings/settings-shell";
import type { IntegrationProviderWithStatus } from "@/components/settings/types";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { getSupabaseServerComponentClient } from "@/lib/supabase-clients";
import {
  INTEGRATION_PROVIDERS,
} from "@/lib/integration-providers";
import { getUserIntegrations } from "@/lib/user-integrations";
import { getUserPreferences } from "@/lib/user-preferences";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/settings");
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
        <h2 className="text-base font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These details are visible to teammates inside the workspace.
        </p>
        <dl className="mt-6 divide-y divide-border rounded-lg border">
          <ProfileRow label="Full name" value={user.email.split("@")[0] || "—"} />
          <ProfileRow label="Email" value={user.email} />
        </dl>
      </section>

      <section id="notifications">
        <h2 className="text-base font-semibold">Preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Control how the agents behave across chats.
        </p>
        <div className="mt-6 rounded-lg border p-6">
          <DemoToggle defaultChecked={Boolean(preferences.useDemoData)} />
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold">Integrations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Connected tools drive live data. Disconnecting reverts to demo
          fixtures.
        </p>
        <ul className="mt-6 divide-y divide-border rounded-lg border">
          {providersWithStatus.map((provider) => (
            <li
              key={provider.id}
              className="flex items-center justify-between gap-6 px-4 py-4"
            >
              <div>
                <p className="text-sm font-semibold">{provider.name}</p>
                <p className="text-xs text-muted-foreground">
                  {provider.description}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                  provider.connected
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {provider.connected ? "Connected" : "Not connected"}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Need to update credentials or add a new provider?
          </p>
          <Button asChild variant="outline">
            <Link href="/settings/integrations">Manage integrations</Link>
          </Button>
        </div>
      </section>
    </SettingsShell>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

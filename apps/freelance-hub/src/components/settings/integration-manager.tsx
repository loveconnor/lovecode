"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, PlugZap, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type {
  IntegrationProviderMeta,
  IntegrationProviderField,
} from "@/lib/integration-providers";

type ProviderWithStatus = IntegrationProviderMeta & { connected: boolean };

interface IntegrationManagerProps {
  providers: ProviderWithStatus[];
}

export function IntegrationManager({ providers }: IntegrationManagerProps) {
  const [items, setItems] = useState(providers);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const updateProviderState = (providerId: string, connected: boolean) => {
    setItems((prev) =>
      prev.map((provider) =>
        provider.id === providerId ? { ...provider, connected } : provider,
      ),
    );
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    providerId: string,
  ) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string" && value.trim().length > 0) {
        payload[key] = value.trim();
      }
    }

    try {
      setLoadingProvider(providerId);
      const response = await fetch("/api/user-integrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId, values: payload }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to save integration");
      }

      updateProviderState(providerId, true);
      formElement?.reset?.();
      toast.success("Integration saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save integration",
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    try {
      setLoadingProvider(providerId);
      const response = await fetch("/api/user-integrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to disconnect");
      }
      updateProviderState(providerId, false);
      toast.success("Disconnected");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to disconnect",
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-5">
      {items.map((provider) => (
        <div
          key={provider.id}
          className="rounded-lg border border-border/70 p-4 space-y-4"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                {provider.connected ? (
                  <PlugZap className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Unplug className="h-4 w-4 text-muted-foreground" />
                )}
                {provider.name}
              </div>
              <p className="text-sm text-muted-foreground">
                {provider.description}
              </p>
            </div>
            <Badge variant={provider.connected ? "default" : "outline"}>
              {provider.connected ? "Connected" : "Not connected"}
            </Badge>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => handleSubmit(event, provider.id)}
          >
            {provider.fields.map((field: IntegrationProviderField) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={`${provider.id}-${field.id}`}>
                  {field.label}
                </Label>
                <Input
                  id={`${provider.id}-${field.id}`}
                  name={field.id}
                  type={field.type === "password" ? "password" : "text"}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  required={field.required !== false}
                />
                {field.helperText && (
                  <p className="text-xs text-muted-foreground">
                    {field.helperText}
                  </p>
                )}
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                disabled={loadingProvider === provider.id}
                className="sm:w-auto"
              >
                {loadingProvider === provider.id && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save credentials
              </Button>
              {provider.connected && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleDisconnect(provider.id)}
                  disabled={loadingProvider === provider.id}
                >
                  Disconnect
                </Button>
              )}
            </div>
          </form>
        </div>
      ))}
    </div>
  );
}

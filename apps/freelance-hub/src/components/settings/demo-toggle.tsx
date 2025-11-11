"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface DemoToggleProps {
  defaultChecked: boolean;
}

export function DemoToggle({ defaultChecked }: DemoToggleProps) {
  const [checked, setChecked] = useState(defaultChecked);
  const [isPending, startTransition] = useTransition();

  const onChange = (nextValue: boolean) => {
    setChecked(nextValue);
    startTransition(async () => {
      try {
        const response = await fetch("/api/user-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ useDemoData: nextValue }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Unable to update preference");
        }
        toast.success(
          nextValue
            ? "Demo data enabled. Agents will use sandbox responses."
            : "Demo data disabled. Agents will call live integrations.",
        );
      } catch (error) {
        setChecked(!nextValue);
        toast.error(
          error instanceof Error ? error.message : "Failed to update setting",
        );
      }
    });
  };

  return (
    <div className="flex items-center justify-between rounded-lg p-4">
      <div>
        <Label className="text-base">Use Demo Data</Label>
        <p className="text-sm text-muted-foreground">
          When enabled, agents skip external integrations and use sandbox data.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          disabled={isPending}
          aria-label="Toggle demo data mode"
        />
      </div>
    </div>
  );
}

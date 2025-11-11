import type { IntegrationProviderMeta } from "@/lib/integration-providers";

export type IntegrationProviderWithStatus = IntegrationProviderMeta & {
  connected: boolean;
};

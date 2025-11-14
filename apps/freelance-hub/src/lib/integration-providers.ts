export type IntegrationProviderId =
  | "quickbooks"
  | "greenhouse"
  | "notion"
  | "stripe"
  | "linear"
  | "asana"
  | "gmail";

export interface IntegrationProviderField {
  id: string;
  label: string;
  type?: "text" | "password";
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export interface IntegrationProviderMeta {
  id: IntegrationProviderId;
  name: string;
  description: string;
  fields: IntegrationProviderField[];
}

export const INTEGRATION_PROVIDERS: IntegrationProviderMeta[] = [
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Power finance dashboards from your QuickBooks company.",
    fields: [
      {
        id: "realmId",
        label: "Realm ID",
        placeholder: "1234567890",
        helperText: "Find it in QuickBooks > Settings > Account & Settings",
      },
      {
        id: "accessToken",
        label: "Access Token",
        type: "password",
        helperText: "Paste a current OAuth access token for the QuickBooks API",
      },
    ],
  },
  {
    id: "greenhouse",
    name: "Greenhouse Harvest",
    description: "Import the recruiting bench for the web dev agent.",
    fields: [
      {
        id: "apiToken",
        label: "Harvest API Token",
        type: "password",
        helperText: "Greenhouse Settings → Dev Center → API Credential",
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Search web ops docs and briefs directly from Notion.",
    fields: [
      {
        id: "apiToken",
        label: "Internal Integration Token",
        type: "password",
        helperText: "Notion Settings → Connections → New integration",
      },
      {
        id: "databaseId",
        label: "Docs Database ID",
        placeholder: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        helperText: "Open the database in Notion and copy the ID from the URL",
      },
    ],
  },
  {
    id: "stripe",
    name: "Stripe Billing",
    description: "Create/update/list invoices and payouts from Stripe.",
    fields: [
      {
        id: "secretKey",
        label: "Secret Key",
        type: "password",
        placeholder: "sk_live_...",
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    description: "Show web project progress and delivery health from Linear.",
    fields: [
      {
        id: "apiKey",
        label: "API Key",
        type: "password",
        helperText: "Linear Settings → Create new personal API key",
      },
    ],
  },
  {
    id: "asana",
    name: "Asana",
    description: "Sync time entries and task data from Asana.",
    fields: [
      {
        id: "accessToken",
        label: "Personal Access Token",
        type: "password",
      },
      {
        id: "workspaceId",
        label: "Workspace ID (optional)",
        placeholder: "1201234567890123",
        helperText: "Set to override the default workspace detection",
        required: false,
      },
    ],
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Let web ops triage the shared inbox via Gmail API.",
    fields: [
      {
        id: "accessToken",
        label: "OAuth Access Token",
        type: "password",
        helperText: "Provide a short-lived access token for the Gmail API",
      },
    ],
  },
];

export const INTEGRATION_PROVIDER_MAP = Object.fromEntries(
  INTEGRATION_PROVIDERS.map((provider) => [provider.id, provider]),
) as Record<IntegrationProviderId, IntegrationProviderMeta>;

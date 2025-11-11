import {
  ArrowRight,
  BarChart3,
  Brain,
  Calculator,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Flame,
  FolderOpen,
  Inbox,
  PieChart,
  Play,
  Receipt,
  Search,
  Square,
  Timer,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface ToolConfig {
  name: string;
  icon: IconComponent;
  description?: string;
}

export const TOOL_CONFIGS: Record<string, ToolConfig> = {
  // Pipeline desk
  revenue: {
    name: "Pipeline Pulse",
    icon: TrendingUp,
    description: "Tracking bookings + pipeline momentum",
  },
  profitLoss: {
    name: "Deal Desk",
    icon: BarChart3,
    description: "Watching profit per stream",
  },
  cashFlow: {
    name: "Cash Drift",
    icon: DollarSign,
    description: "Following money in/out of the collective",
  },
  balanceSheet: {
    name: "Studio Balance Board",
    icon: FileSpreadsheet,
    description: "Visualizing cash, AR, and obligations",
  },
  expenses: {
    name: "Ops Spend",
    icon: Receipt,
    description: "Breaking down studio expenses",
  },
  burnRate: {
    name: "Creative Burn",
    icon: Flame,
    description: "Comparing burn vs. plan",
  },
  runway: {
    name: "Booking Runway",
    icon: Calendar,
    description: "Projecting months of runway",
  },
  spending: {
    name: "Delivery Mix",
    icon: CreditCard,
    description: "Showing how work is delivered",
  },
  taxSummary: {
    name: "Compliance Packet",
    icon: FileText,
    description: "Packaging tax-ready summaries",
  },

  // Market intel
  businessHealth: {
    name: "Studio Health Score",
    icon: PieChart,
    description: "Scoring overall financial health",
  },
  cashFlowForecast: {
    name: "Future Cash",
    icon: TrendingUp,
    description: "Forecasting upcoming cash swings",
  },
  stressTest: {
    name: "Stress Test",
    icon: Calculator,
    description: "Simulating worst-case scenarios",
  },

  // Talent bench
  getTalent: {
    name: "Talent Profile",
    icon: User,
    description: "Loading a talent profile",
  },
  listTalent: {
    name: "Bench Radar",
    icon: Users,
    description: "Listing available talent",
  },
  createTalent: {
    name: "Add Talent",
    icon: Users,
    description: "Drafting a new talent card",
  },
  updateTalent: {
    name: "Refresh Talent",
    icon: User,
    description: "Updating a talent profile",
  },
  utilization: {
    name: "Utilization Pulse",
    icon: BarChart3,
    description: "Analyzing availability + hours",
  },

  // Payments
  listPayouts: {
    name: "Payout Queue",
    icon: FileText,
    description: "Listing upcoming payouts/invoices",
  },
  getPayout: {
    name: "Payout Detail",
    icon: FileText,
    description: "Inspecting a payout packet",
  },
  createPayout: {
    name: "Draft Payout",
    icon: FileText,
    description: "Creating an invoice/payout",
  },
  updatePayout: {
    name: "Update Payout",
    icon: FileText,
    description: "Adjusting payout details",
  },

  // Ledger / payouts
  listLedger: {
    name: "Ledger Feed",
    icon: Receipt,
    description: "Reviewing ledger activity",
  },
  getLedgerEntry: {
    name: "Ledger Entry",
    icon: Receipt,
    description: "Zooming into a ledger entry",
  },

  // Projects & sprints
  startSprint: {
    name: "Start Sprint Timer",
    icon: Play,
    description: "Starting a project timer",
  },
  stopSprint: {
    name: "Stop Sprint Timer",
    icon: Square,
    description: "Stopping a project timer",
  },
  listTimeEntries: {
    name: "Time Entries",
    icon: Clock,
    description: "Listing logged minutes",
  },
  logTime: {
    name: "Log Time",
    icon: Timer,
    description: "Recording fresh minutes",
  },
  updateTimeLog: {
    name: "Update Time Log",
    icon: Timer,
    description: "Editing a time entry",
  },
  deleteTimeLog: {
    name: "Delete Time Log",
    icon: Timer,
    description: "Removing a time entry",
  },
  listProjects: {
    name: "Project Roster",
    icon: FolderOpen,
    description: "Listing studio projects",
  },

  // Studio ops
  listInbox: {
    name: "Studio Inbox",
    icon: Inbox,
    description: "Surfacing inbound documents",
  },
  getBalances: {
    name: "Account Balances",
    icon: Wallet,
    description: "Checking account balances",
  },
  listDocuments: {
    name: "Document Vault",
    icon: FileArchive,
    description: "Listing studio documents",
  },
  exportData: {
    name: "Data Export",
    icon: Download,
    description: "Packaging data for sharing",
  },

  // Research tools
  webSearch: {
    name: "Web Search",
    icon: Search,
    description: "Scanning the web",
  },

  // Memory tools
  updateWorkingMemory: {
    name: "Update Memory",
    icon: Brain,
    description: "Updating working memory",
  },

  // Handoff tools
  handoff_to_agent: {
    name: "Routing",
    icon: ArrowRight,
    description: "Routing to specialist",
  },
};

/**
 * Get tool configuration by tool name
 */
export function getToolConfig(toolName: string): ToolConfig | null {
  return TOOL_CONFIGS[toolName] || null;
}

/**
 * Get tool icon component by tool name
 */
export function getToolIcon(toolName: string): IconComponent | null {
  const config = getToolConfig(toolName);
  return config?.icon || null;
}

/**
 * Get tool display name by tool name
 */
export function getToolDisplayName(toolName: string): string | null {
  const config = getToolConfig(toolName);
  return config?.name || null;
}

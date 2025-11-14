import type { AgentStatus } from "@/types/agents";

// Generate user-friendly status messages
export const getStatusMessage = (status?: AgentStatus | null) => {
  if (!status) {
    return null;
  }

  const { agent, status: state } = status;

  if (state === "routing") {
    return "Thinking...";
  }

  if (state === "executing") {
    const messages: Record<AgentStatus["agent"], string> = {
      triage: "Thinking...",
      orchestrator: "Coordinating your request...",
      general: "Getting information for you...",
      pipeline: "Checking on the web delivery pipeline...",
      payouts: "Reviewing the payout ledger...",
      payments: "Prepping invoices and payouts...",
      projects: "Updating project logs...",
      talent: "Reviewing the web dev bench...",
      marketIntel: "Scanning the market pulse...",
      studioOps: "Grabbing web ops files...",
      research: "Researching and analyzing your options...",
    };

    return messages[agent];
  }

  return null;
};

// Generate user-friendly tool messages
export const getToolMessage = (toolName: string | null) => {
  if (!toolName) return null;

  const toolMessages: Record<string, string> = {
    // Reports tools
    revenue: "Charting your pipeline momentum...",
    profitLoss: "Looking at profit per stream...",
    cashFlow: "Projecting cash hitting the web program...",
    balanceSheet: "Generating the web ops balance board...",
    expenses: "Reviewing web program spend...",
    burnRate: "Checking web delivery burn vs. plan...",
    runway: "Calculating web dev capacity runway...",
    spending: "Breaking down delivery mix...",
    taxSummary: "Packaging compliance-ready numbers...",

    // Analytics tools
    businessHealth: "Scoring web org health...",
    cashFlowForecast: "Projecting future cash swing...",
    stressTest: "Running 'what-if' stress scenarios...",

    // Talent tools
    getTalent: "Pulling that web dev profile...",
    listTalent: "Scanning the web bench...",
    createTalent: "Drafting a new web dev card...",
    updateTalent: "Refreshing that web dev profile...",
    utilization: "Calculating utilization + capacity...",

    // Invoice / payout tools
    listPayouts: "Listing upcoming payouts...",
    getPayout: "Loading payout details...",
    createPayout: "Drafting the payout packet...",
    updatePayout: "Updating payout info...",

    // Transaction tools
    listLedger: "Reviewing ledger activity...",
    getLedgerEntry: "Pulling that ledger entry...",

    // Time tracking tools
    startSprint: "Starting the sprint timer...",
    stopSprint: "Stopping the sprint timer...",
    listTimeEntries: "Listing recent time logs...",
    logTime: "Adding those minutes...",
    updateTimeLog: "Tweaking the time log...",
    deleteTimeLog: "Removing that log...",
    listProjects: "Loading project status...",

    // Operations tools
    listInbox: "Clearing the web program inbox...",
    getBalances: "Checking balances for you...",
    listDocuments: "Opening the right doc...",
    exportData: "Packaging a shareable export...",

    // Research tools
    webSearch: "Searching the web...",

    // Memory tools
    updateWorkingMemory: "Updating working memory...",

    // Handoff tools
    handoff_to_agent: "Connecting you with the right specialist...",
  };

  return toolMessages[toolName];
};

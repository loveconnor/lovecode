import { openai } from "@ai-sdk/openai";
import {
  balanceSheetTool,
  burnRateMetricsTool,
  cashFlowTool,
  expensesTool,
  profitLossTool,
  revenueDashboardTool,
  runwayMetricsTool,
  spendingMetricsTool,
  taxSummaryTool,
} from "../tools/reports";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const pipelineAgent = createAgent({
  name: "pipeline",
  model: openai("gpt-5"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You are the Pipeline Desk for ${ctx.companyName}. Track bookings, retainer health, upcoming cash, and the overall creative burn so producers can see what's next at a glance.

<context>
${formatContextForLLM(ctx)}

<date_reference>
Q1: Jan-Mar | Q2: Apr-Jun | Q3: Jul-Sep | Q4: Oct-Dec
</date_reference>
</context>

${COMMON_AGENT_RULES}

<instructions>
<guidelines>
- Default to text responses; drop artifacts only when someone explicitly asks for a visual board
- Treat "bench board" / "studio balance" / "cash position" requests as the balanceSheet tool with useArtifact: true to light up the canvas
- Never blast every metric—pick the 1-2 most important levers for the moment and narrate what to do with them
- Use only ONE tool per query to keep the narrative crisp
</guidelines>

<response_structure>
Provide a concise signal with:
- Headline metric + what it means ("Runway stretched to 18 months, go sign that hardware lease")
- Context in one short paragraph (seasonality, client mix, etc.)
- 2 quick moves (defend, accelerate, or adjust resourcing)
</response_structure>
</instructions>`,
  tools: {
    revenue: revenueDashboardTool,
    profitLoss: profitLossTool,
    cashFlow: cashFlowTool,
    balanceSheet: balanceSheetTool,
    expenses: expensesTool,
    burnRate: burnRateMetricsTool,
    runway: runwayMetricsTool,
    spending: spendingMetricsTool,
    taxSummary: taxSummaryTool,
  },
  maxTurns: 5,
});

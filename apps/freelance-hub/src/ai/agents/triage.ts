import { openai } from "@ai-sdk/openai";
import { generalAgent } from "./general";
import { marketIntelAgent } from "./market-intel";
import { paymentsAgent } from "./payments";
import { payoutsAgent } from "./payouts";
import { pipelineAgent } from "./pipeline";
import { projectsAgent } from "./projects";
import { researchAgent } from "./research";
import { createAgent, formatContextForLLM } from "./shared";
import { studioOpsAgent } from "./studio-ops";
import { talentAgent } from "./talent";

export const triageAgent = createAgent({
  name: "triage",
  model: openai("gpt-5"),
  temperature: 0.1,
  modelSettings: {
    toolChoice: {
      type: "tool",
      toolName: "handoff_to_agent",
    },
  },
  instructions: (
    ctx,
  ) => `You are the switchboard for ${ctx.companyName}'s web dev control room. Listen for intent, cross-check context, then hand the conversation to the most capable specialist.

<background-data>
${formatContextForLLM(ctx)}

<agent-capabilities>
research: Deep dives on new verticals, client inspo, framework shifts, high-consideration tooling
general: Greetings, catch-ups, lightweight clarifications, web search
studioOps: Inbox triage, document retrieval, account/balance lookups, exports
pipeline: Web project bookings, runway, cash forecasts, profitability, "bench board" visualizations
marketIntel: Rate cards, demand signals, stress testing scenarios
payouts: Cash-moving ledger questions, large or unusual web dev payouts, reconciliations
payments: Invoice creation, status checks, overdue nudges, payout logistics
projects: Sprint timers, time entry edits, project status, retainer variance
talent: Web developer bench availability, new intake, utilization analysis, pairing ideas
</agent-capabilities>
</background-data>`,
  handoffs: [
    researchAgent,
    generalAgent,
    studioOpsAgent,
    pipelineAgent,
    marketIntelAgent,
    payoutsAgent,
    paymentsAgent,
    projectsAgent,
    talentAgent,
  ],
  maxTurns: 1,
});

import { openai } from "@ai-sdk/openai";
import { getLedgerEntryTool, listLedgerTool } from "../tools/transactions";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const payoutsAgent = createAgent({
  name: "payouts",
  model: openai("gpt-5"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You monitor the payout ledger for ${ctx.companyName}. Surface incoming retainers, freelance web developer payouts, and unusual movement so web leads see issues before finance does.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<agent-specific-rules>
- Lead with the number that changed (amount, delta vs. average, etc.)
- When someone asks for "biggest" or "latest", filter appropriately before responding
- Always suggest a next action when a payout is late, duplicated, or missing context
</agent-specific-rules>`,
  tools: {
    listLedger: listLedgerTool,
    getLedgerEntry: getLedgerEntryTool,
  },
  maxTurns: 5,
});

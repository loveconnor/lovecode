import { openai } from "@ai-sdk/openai";
import {
  createPayoutTool,
  getPayoutTool,
  listPayoutsTool,
  updatePayoutTool,
} from "../tools/invoices";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const paymentsAgent = createAgent({
  name: "payments",
  model: openai("gpt-5"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You run payouts for ${ctx.companyName}. Keep contractors paid, chase late clients gracefully, and spin up invoices that match how the project actually ran.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<agent-specific-rules>
- Always reference currency and due windows
- Call out blockers (missing PO, unapproved hours, etc.) and propose next steps
- When creating invoices, note if delivery is retainer, sprint, or fixed-bid
</agent-specific-rules>`,
  tools: {
    listPayouts: listPayoutsTool,
    getPayout: getPayoutTool,
    createPayout: createPayoutTool,
    updatePayout: updatePayoutTool,
  },
  maxTurns: 5,
});

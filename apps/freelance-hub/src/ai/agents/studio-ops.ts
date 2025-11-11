import { openai } from "@ai-sdk/openai";
import {
  exportDataTool,
  getBalancesTool,
  listDocumentsTool,
  listInboxItemsTool,
} from "../tools/operations";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const studioOpsAgent = createAgent({
  name: "studioOps",
  model: openai("gpt-5"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You're the studio ops lead for ${ctx.companyName}. Keep the collective's inbox tidy, surface key docs, and dump whatever data the crew needs into clean exports.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<guidelines>
- Lead with the artifact requested (doc, balance, inbox item) before color commentary
- Assume users are juggling multiple gigs—pinpoint exactly where a file or balance lives
- Offer to package data in exports whenever someone hints at reporting or sharing outside the workspace
</guidelines>`,
  tools: {
    listInbox: listInboxItemsTool,
    getBalances: getBalancesTool,
    listDocuments: listDocumentsTool,
    exportData: exportDataTool,
  },
  maxTurns: 5,
});

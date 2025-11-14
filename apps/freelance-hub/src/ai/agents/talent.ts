import { openai } from "@ai-sdk/openai";
import {
  createTalentTool,
  getTalentTool,
  listTalentTool,
  talentUtilizationTool,
  updateTalentTool,
} from "../tools/customers";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const talentAgent = createAgent({
  name: "talent",
  model: openai("gpt-5"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You run the web developer bench for ${ctx.companyName}. Keep tabs on who's deployable, what each engineer loves building on the web, and how much they're contributing to delivery + revenue.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<agent-specific-rules>
- Always mention availability windows (now, upcoming, booked)
- Flag pairing ideas whenever you spot stack overlap with open web briefs or clients
- When sharing utilization, translate it into action (e.g., "slot Priya into the Headless Commerce build for 12 open hours")
</agent-specific-rules>`,
  tools: {
    getTalent: getTalentTool,
    listTalent: listTalentTool,
    createTalent: createTalentTool,
    updateTalent: updateTalentTool,
    utilization: talentUtilizationTool,
  },
  maxTurns: 5,
});

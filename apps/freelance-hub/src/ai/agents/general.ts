import { openai } from "@ai-sdk/openai";
import { webSearchTool } from "../tools/search";
import { marketIntelAgent } from "./market-intel";
import { paymentsAgent } from "./payments";
import { payoutsAgent } from "./payouts";
import { pipelineAgent } from "./pipeline";
import { projectsAgent } from "./projects";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";
import { studioOpsAgent } from "./studio-ops";
import { talentAgent } from "./talent";

export const generalAgent = createAgent({
  name: "general",
  model: openai("gpt-5"),
  temperature: 0.8,
  instructions: (
    ctx,
  ) => `You are the concierge for ${ctx.companyName}, a freelance & contractor hub. Keep conversations warm, know what's happening across the studio, and route requests to the right specialist fast.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<capabilities>
- Answer lightweight questions directly (greetings, quick clarifications, inspiration)
- Use webSearch for fresh intel, especially rate cards, events, or tech news
- Route to specialists for anything involving studio data, payouts, or automation
</capabilities>`,
  tools: {
    webSearch: webSearchTool,
  },
  handoffs: [
    studioOpsAgent,
    pipelineAgent,
    marketIntelAgent,
    payoutsAgent,
    talentAgent,
    paymentsAgent,
    projectsAgent,
  ],
  maxTurns: 5,
});

import { openai } from "@ai-sdk/openai";
import {
  businessHealthScoreTool,
  cashFlowForecastTool,
  cashFlowStressTestTool,
} from "../tools/analytics";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const marketIntelAgent = createAgent({
  name: "marketIntel",
  model: openai("gpt-5"),
  temperature: 0.5,
  instructions: (
    ctx,
  ) => `You lead market intelligence for ${ctx.companyName}, a distributed network of freelance web developers. Drop sharp takes on rate trends, demand signals, and "what-if" scenarios web leads can act on immediately.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<agent-specific-rules>
- Lead with the most surprising signal (rate spike, demand swing, framework shift)
- Translate forecasts into concrete web delivery moves (raise rate, open bench slot, rebalance squads)
- When stress testing, narrate what breaks first and offer a mitigation play
</agent-specific-rules>`,
  tools: {
    businessHealth: businessHealthScoreTool,
    cashFlowForecast: cashFlowForecastTool,
    stressTest: cashFlowStressTestTool,
  },
  maxTurns: 5,
});

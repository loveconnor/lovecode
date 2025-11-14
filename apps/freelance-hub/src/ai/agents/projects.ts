import { openai } from "@ai-sdk/openai";
import {
  deleteTimeLogTool,
  listProjectsTool,
  listTimeEntriesTool,
  logTimeTool,
  startSprintTool,
  stopSprintTool,
  updateTimeLogTool,
} from "../tools/tracker";
import { COMMON_AGENT_RULES, createAgent, formatContextForLLM } from "./shared";

export const projectsAgent = createAgent({
  name: "projects",
  model: openai("gpt-5"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You run the web delivery desk for ${ctx.companyName}. Keep sprints honest, log hours fast, and make sure no retainer quietly goes over scope.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<agent-specific-rules>
- Always mention project, phase, and who logged the minutes
- Summarize totals when listing multiple entries and note variance vs. plan
- Offer to spin up timers when someone hints at “I'll start working on…”
</agent-specific-rules>`,
  tools: {
    startSprint: startSprintTool,
    stopSprint: stopSprintTool,
    listTimeEntries: listTimeEntriesTool,
    logTime: logTimeTool,
    updateTimeLog: updateTimeLogTool,
    deleteTimeLog: deleteTimeLogTool,
    listProjects: listProjectsTool,
  },
  maxTurns: 2,
});

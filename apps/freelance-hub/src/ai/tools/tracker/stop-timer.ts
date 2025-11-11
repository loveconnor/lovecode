import { tool } from "ai";
import { z } from "zod";
import { generateStoppedTimer } from "@/ai/utils/fake-data";

export const stopSprintTool = tool({
  description: `Stop the active sprint timer or a specific timer entry.`,

  inputSchema: z.object({
    entryId: z
      .string()
      .optional()
      .describe("Specific timer entry ID to stop (defaults to current timer)"),
    stopTime: z
      .string()
      .optional()
      .describe("Stop time in ISO 8601 format (defaults to now)"),
  }),

  execute: async (params) => generateStoppedTimer(params),
});

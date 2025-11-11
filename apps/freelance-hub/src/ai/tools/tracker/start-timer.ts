import { tool } from "ai";
import { z } from "zod";
import { generateStartedTimer } from "@/ai/utils/fake-data";

export const startSprintTool = tool({
  description: `Start a sprint timer for a project or retainer.`,

  inputSchema: z.object({
    projectId: z.string().describe("Project ID to track time for"),
    description: z
      .string()
      .optional()
      .describe("Optional description of the work"),
    startTime: z
      .string()
      .optional()
      .describe("Start time in ISO 8601 format (defaults to now)"),
  }),

  execute: async (params) => generateStartedTimer(params),
});

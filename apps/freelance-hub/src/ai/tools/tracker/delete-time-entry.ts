import { tool } from "ai";
import { z } from "zod";
import { generateDeletedTimeEntry } from "@/ai/utils/fake-data";

export const deleteTimeLogTool = tool({
  description: `Delete a time log.`,

  inputSchema: z.object({
    entryId: z.string().describe("Time entry ID to delete"),
  }),

  execute: async (params) => generateDeletedTimeEntry(params),
});

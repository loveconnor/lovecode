import { tool } from "ai";
import { z } from "zod";
import { generateCustomer } from "@/ai/utils/fake-data";

export const getTalentTool = tool({
  description: `Get a talent profile by ID.`,

  inputSchema: z.object({
    customerId: z.string().describe("Talent ID"),
  }),

  execute: async (params) => generateCustomer(params),
});

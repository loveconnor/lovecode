import { tool } from "ai";
import { z } from "zod";
import { generateCreatedCustomer } from "@/ai/utils/fake-data";

export const createTalentTool = tool({
  description: `Create a new freelance web developer profile for the bench.`,

  inputSchema: z.object({
    name: z.string().describe("Web developer name or handle"),
    email: z.string().email().describe("Primary contact email"),
    phone: z.string().optional().describe("Phone or preferred channel"),
    address: z.string().optional().describe("City or timezone shorthand"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Tags such as stack, expertise, seniority"),
  }),

  execute: async (params) => generateCreatedCustomer(params),
});

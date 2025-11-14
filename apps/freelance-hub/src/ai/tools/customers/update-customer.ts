import { tool } from "ai";
import { z } from "zod";
import { generateUpdatedCustomer } from "@/ai/utils/fake-data";

export const updateTalentTool = tool({
  description: `Update an existing freelance web developer profile.`,
  inputSchema: z.object({
    customerId: z.string().describe("Web developer ID to update"),
    name: z.string().optional().describe("Updated name"),
    email: z.string().email().optional().describe("Updated email"),
    phone: z.string().optional().describe("Updated phone/handle"),
    address: z.string().optional().describe("Updated location/timezone"),
    tags: z.array(z.string()).optional().describe("Updated tags"),
  }),
  execute: async (params) => generateUpdatedCustomer(params),
});

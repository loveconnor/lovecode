import { tool } from "ai";
import { z } from "zod";
import { dateRangeSchema } from "@/ai/types/filters";
import { generateCustomerProfitability } from "@/ai/utils/fake-data";

export const talentUtilizationTool = tool({
  description: `Analyze a freelancer's utilization, revenue impact, and available hours.`,

  inputSchema: z
    .object({
      talentId: z.string().describe("Talent ID or handle"),
    })
    .merge(dateRangeSchema),

  execute: async ({ talentId, ...rest }) =>
    generateCustomerProfitability({ customerId: talentId, ...rest }),
});

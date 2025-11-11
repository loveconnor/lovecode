import { tool } from "ai";
import { z } from "zod";
import { generateCustomer } from "@/ai/utils/fake-data";
import {
  fetchGreenhouseTalent,
  withIntegrationFallback,
} from "@/lib/integrations";

export const listTalentTool = tool({
  description: `List freelancers/contractors with optional filters for availability, tags, or revenue contribution.`,

  inputSchema: z.object({
    limit: z
      .number()
      .optional()
      .describe("Maximum number of talent cards to return (default: 10)"),
    sortBy: z
      .enum(["revenue", "name", "created"])
      .optional()
      .describe("Sort by revenue contribution, name, or join date"),
    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .describe("Sort order (default: desc for revenue, asc for others)"),
    tags: z
      .array(z.string())
      .optional()
      .describe("Filter by tags (skill, timezone, seniority, etc.)"),
  }),

  execute: async (params, executionOptions) => {
    const {
      limit = 10,
      sortBy = "revenue",
      sortOrder = sortBy === "revenue" ? "desc" : "asc",
      tags,
    } = params;

    const integrations = (executionOptions?.experimental_context
      ?.integrations ?? {}) as Record<string, Record<string, string>>;
    const demoMode = executionOptions?.experimental_context?.demoMode === true;
    const greenhouseCreds =
      !demoMode && integrations.greenhouse?.apiToken
        ? { apiToken: integrations.greenhouse.apiToken }
        : undefined;

    const talent = greenhouseCreds?.apiToken
      ? await withIntegrationFallback(
          "greenhouse",
          () =>
            fetchGreenhouseTalent(
              {
                limit,
                tags,
              },
              greenhouseCreds,
            ),
          async () => generateMockTalent(limit),
        )
      : generateMockTalent(limit);

    let filtered = talent;
    if (tags && tags.length > 0) {
      filtered = talent.filter((profile) =>
        profile.tags?.some((tag: string) => tags.includes(tag)),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "revenue") {
        comparison = (a.totalRevenue ?? 0) - (b.totalRevenue ?? 0);
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    const result = sorted.slice(0, limit);

    return {
      talent: result,
      total: filtered.length,
      returned: result.length,
      sortedBy: sortBy,
      sortOrder,
    };
  },
});

function generateMockTalent(limit: number) {
  return Array.from({ length: Math.max(limit, 10) }, (_, i) => {
    const profile = generateCustomer({ customerId: `TAL-${1000 + i}` });
    const revenue =
      Math.abs(
        profile.id
          .split("")
          .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0),
      ) * 1000;
    return {
      ...profile,
      totalRevenue: revenue,
    };
  });
}

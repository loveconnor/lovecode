import { tool } from "ai";
import { z } from "zod";
import { generateTimeEntries } from "@/ai/utils/fake-data";
import {
  fetchAsanaTimeEntries,
  withIntegrationFallback,
} from "@/lib/integrations";

export const listTimeEntriesTool = tool({
  description: `List time entries for sprints or retainers with filters.`,

  inputSchema: z.object({
    from: z.string().describe("Start date in YYYY-MM-DD format"),
    to: z.string().describe("End date in YYYY-MM-DD format"),
    projectId: z.string().optional().describe("Filter by project ID"),
    assignedId: z.string().optional().describe("Filter by user ID"),
  }),

  execute: async (params, executionOptions) => {
    const integrations = (executionOptions?.experimental_context
      ?.integrations ?? {}) as Record<string, Record<string, string>>;
    const demoMode = executionOptions?.experimental_context?.demoMode === true;
    const asanaCreds = !demoMode ? integrations.asana : undefined;

    if (!asanaCreds?.accessToken) {
      return generateTimeEntries(params);
    }

    return withIntegrationFallback(
      "asana",
      async () => {
        const entries = await fetchAsanaTimeEntries(
          {
            from: params.from,
            to: params.to,
            projectId: params.projectId,
            assignee: params.assignedId,
          },
          {
            accessToken: asanaCreds.accessToken,
            workspaceId: asanaCreds.workspaceId,
          },
        );
        return {
          data: entries.map((entry) => ({
            id: entry.id,
            name: entry.name,
            project: entry.project,
            assignee: entry.assignee,
            dueDate: entry.dueDate,
            completedAt: entry.completedAt,
            notes: entry.notes,
          })),
          total: entries.length,
        };
      },
      async () => generateTimeEntries(params),
    );
  },
});

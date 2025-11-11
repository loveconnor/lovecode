import { tool } from "ai";
import { z } from "zod";
import { generateTrackerProjects } from "@/ai/utils/fake-data";
import {
  fetchAsanaProjects,
  fetchLinearProjects,
  withIntegrationFallback,
} from "@/lib/integrations";

export const listProjectsTool = tool({
  description: `List studio projects filtered by status for time tracking.`,

  inputSchema: z.object({
    status: z
      .enum(["in_progress", "completed", "all"])
      .optional()
      .default("all")
      .describe("Filter by project status"),
  }),

  execute: async (params, executionOptions) => {
    const integrations = (executionOptions?.experimental_context
      ?.integrations ?? {}) as Record<string, Record<string, string>>;
    const demoMode = executionOptions?.experimental_context?.demoMode === true;
    const asanaCreds = !demoMode ? integrations.asana : undefined;
    const linearCreds = !demoMode ? integrations.linear : undefined;

    if (asanaCreds?.accessToken) {
      const asanaProjects = await withIntegrationFallback(
        "asana",
        async () => {
          const projects = await fetchAsanaProjects(
            { status: params.status },
            {
              accessToken: asanaCreds.accessToken,
              workspaceId: asanaCreds.workspaceId,
            },
          );
          return projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            progress: project.progress,
            health: project.health,
            updatedAt: project.updatedAt,
            startsAt: project.startsAt,
            targetDate: project.targetDate,
          }));
        },
        async () => generateTrackerProjects(params).data,
      );
      return { data: asanaProjects };
    }

    const projects = await withIntegrationFallback(
      "linear",
      async () => {
        const linearProjects = await fetchLinearProjects(
          {
            status: params.status,
          },
          linearCreds ? { apiKey: linearCreds.apiKey } : undefined,
        );
        return linearProjects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
          health: project.health,
          updatedAt: project.updatedAt,
          startsAt: project.startsAt,
          targetDate: project.targetDate,
        }));
      },
      async () => generateTrackerProjects(params).data,
    );

    return { data: projects };
  },
});

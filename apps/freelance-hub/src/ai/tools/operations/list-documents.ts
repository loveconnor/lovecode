import { tool } from "ai";
import { z } from "zod";
import { generateDocuments } from "@/ai/utils/fake-data";
import {
  fetchDocumentsFromNotion,
  withIntegrationFallback,
} from "@/lib/integrations";

export const listDocumentsTool = tool({
  description: `List stored documents with filtering and search`,

  inputSchema: z.object({
    q: z.string().optional().describe("Search query"),
    tags: z.array(z.string()).optional().describe("Filter by document tags"),
    pageSize: z.number().min(1).max(100).optional().default(20),
  }),

  execute: async (params, executionOptions) => {
    const integrations = (executionOptions?.experimental_context
      ?.integrations ?? {}) as Record<string, Record<string, string>>;
    const demoMode = executionOptions?.experimental_context?.demoMode === true;
    const notionCreds =
      !demoMode &&
      integrations.notion?.apiToken &&
      integrations.notion?.databaseId
        ? {
            apiToken: integrations.notion.apiToken,
            databaseId: integrations.notion.databaseId,
          }
        : undefined;

    const result =
      notionCreds?.apiToken && notionCreds.databaseId
        ? await withIntegrationFallback(
            "notion",
            () =>
              fetchDocumentsFromNotion(
                {
                  query: params.q,
                  tags: params.tags,
                  pageSize: params.pageSize,
                },
                notionCreds,
              ),
            async () => generateDocuments(params).data,
          )
        : generateDocuments(params).data;

    return {
      data: result,
      total: result.length,
    };
  },
});

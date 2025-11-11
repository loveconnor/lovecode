import { tool } from "ai";
import { z } from "zod";
import { generateInboxItems } from "@/ai/utils/fake-data";
import {
  fetchGmailInboxMessages,
  withIntegrationFallback,
} from "@/lib/integrations";

export const listInboxItemsTool = tool({
  description: `List items in the inbox (receipts, documents awaiting processing)`,

  inputSchema: z.object({
    status: z
      .enum(["pending", "done", "all"])
      .optional()
      .default("pending")
      .describe("Filter by processing status"),
    pageSize: z.number().min(1).max(100).optional().default(20),
  }),

  execute: async (params, executionOptions) => {
    const integrations = (executionOptions?.experimental_context
      ?.integrations ?? {}) as Record<string, Record<string, string>>;
    const demoMode = executionOptions?.experimental_context?.demoMode === true;
    const gmailCreds =
      !demoMode && integrations.gmail?.accessToken
        ? { accessToken: integrations.gmail.accessToken }
        : undefined;

    const data = gmailCreds?.accessToken
      ? await withIntegrationFallback(
          "gmail",
          () =>
            fetchGmailInboxMessages(
              {
                status: params.status,
                limit: params.pageSize,
              },
              gmailCreds,
            ),
          async () => generateInboxItems(params).data,
        )
      : generateInboxItems(params).data;
    return { data, total: data.length };
  },
});

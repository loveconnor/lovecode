import { tool } from "ai";
import { z } from "zod";
import { generateInvoices } from "@/ai/utils/fake-data";
import {
  listStripeInvoices,
  withIntegrationFallback,
} from "@/lib/integrations";

export const listPayoutsTool = tool({
  description: `List payouts/invoices with filters for clients, status, or timeframe.`,
  inputSchema: z.object({
    pageSize: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of invoices per page (1-100)"),
    start: z
      .string()
      .optional()
      .describe("Start date (inclusive) in ISO 8601 format"),
    end: z
      .string()
      .optional()
      .describe("End date (inclusive) in ISO 8601 format"),
    customers: z.array(z.string()).optional().describe("Filter by client IDs"),
    statuses: z
      .array(z.string())
      .optional()
      .describe("Filter by status: draft, overdue, paid, unpaid, canceled"),
    q: z.string().optional().describe("Search query for invoice text"),
  }),

  execute: async (params, executionOptions) => {
    const integrations = (executionOptions?.experimental_context
      ?.integrations ?? {}) as Record<string, Record<string, string>>;
    const demoMode = executionOptions?.experimental_context?.demoMode === true;
    const stripeCreds =
      !demoMode && integrations.stripe?.secretKey
        ? { secretKey: integrations.stripe.secretKey }
        : undefined;

    return withIntegrationFallback(
      "stripe",
      async () => {
        const invoices = await listStripeInvoices(
          {
            limit: params.pageSize,
            status: params.statuses,
            created:
              params.start || params.end
                ? { start: params.start, end: params.end }
                : undefined,
          },
          stripeCreds,
        );

        return {
          data: invoices.map((invoice) => ({
            id: invoice.id,
            status: invoice.status,
            total: (invoice.total ?? invoice.amount_due) / 100,
            currency: invoice.currency?.toUpperCase(),
            customerId: invoice.customer,
            number: invoice.number,
            dueDate: invoice.due_date
              ? new Date(invoice.due_date * 1000).toISOString()
              : undefined,
            hostedUrl: invoice.hosted_invoice_url,
            amountPaid: invoice.amount_paid / 100,
          })),
          total: invoices.length,
        };
      },
      async () =>
        generateInvoices({
          pageSize: params.pageSize,
          start: params.start,
          end: params.end,
          statuses: params.statuses,
        }),
    );
  },
});

import { tool } from "ai";
import { z } from "zod";
import { generateInvoice } from "@/ai/utils/fake-data";
import {
  retrieveStripeInvoice,
  withIntegrationFallback,
} from "@/lib/integrations";

export const getPayoutTool = tool({
  description: `Get detailed information about a payout/invoice by ID.`,

  inputSchema: z.object({
    id: z.string().describe("Payout or invoice ID"),
  }),

  execute: async ({ id }, executionOptions) => {
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
        const invoice = await retrieveStripeInvoice(id, stripeCreds);
        return {
          id: invoice.id,
          status: invoice.status,
          total: (invoice.total ?? invoice.amount_due) / 100,
          currency: invoice.currency?.toUpperCase(),
          customerId: invoice.customer,
          number: invoice.number,
          hostedUrl: invoice.hosted_invoice_url,
          amountPaid: invoice.amount_paid / 100,
          description: invoice.description,
          dueDate: invoice.due_date
            ? new Date(invoice.due_date * 1000).toISOString()
            : undefined,
        };
      },
      async () => generateInvoice(id),
    );
  },
});

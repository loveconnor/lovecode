import { tool } from "ai";
import { z } from "zod";
import { generateCreatedInvoice } from "@/ai/utils/fake-data";
import {
  createStripeInvoice,
  withIntegrationFallback,
} from "@/lib/integrations";

export const createPayoutTool = tool({
  description: `Create a new payout packet (invoice) for a client or partner.`,
  inputSchema: z.object({
    customerId: z.string().describe("Client or partner ID to invoice"),
    lineItems: z
      .array(
        z.object({
          description: z.string(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
        }),
      )
      .min(1)
      .describe("Invoice line items"),
    dueDate: z.string().optional().describe("Due date in ISO 8601 format"),
    currency: z.string().optional().default("USD").describe("Currency code"),
    sendImmediately: z
      .boolean()
      .optional()
      .default(false)
      .describe("Send payout/invoice immediately after creation"),
    notes: z.string().optional().describe("Additional notes for the invoice"),
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
        const invoice = await createStripeInvoice(params, stripeCreds);
        return {
          id: invoice.id,
          status: invoice.status,
          total: (invoice.total ?? invoice.amount_due) / 100,
          currency: invoice.currency?.toUpperCase(),
          customerId: invoice.customer,
          hostedUrl: invoice.hosted_invoice_url,
          number: invoice.number,
        };
      },
      async () => {
        const total = params.lineItems.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        );

        return generateCreatedInvoice({
          ...params,
          total,
          status: params.sendImmediately ? "sent" : "draft",
        });
      },
    );
  },
});

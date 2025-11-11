import { tool } from "ai";
import { z } from "zod";
import { generateUpdatedInvoice } from "@/ai/utils/fake-data";
import {
  updateStripeInvoice,
  withIntegrationFallback,
} from "@/lib/integrations";

export const updatePayoutTool = tool({
  description: `Update an existing payout/invoice (status, lines, send state).`,

  inputSchema: z.object({
    invoiceId: z.string().describe("Payout/Invoice ID to update"),
    status: z
      .enum(["draft", "sent", "paid", "canceled"])
      .optional()
      .describe("New invoice status"),
    lineItems: z
      .array(
        z.object({
          description: z.string(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
        }),
      )
      .optional()
      .describe("Updated line items"),
    dueDate: z.string().optional().describe("Updated due date"),
    notes: z.string().optional().describe("Updated notes"),
    sendToCustomer: z
      .boolean()
      .optional()
      .describe("Send payout/invoice to client after update"),
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
        const updatePayload: Record<string, string> = {};
        if (params.status) updatePayload.status = params.status;
        if (params.dueDate) {
          updatePayload.due_date = String(
            Math.floor(new Date(params.dueDate).getTime() / 1000),
          );
        }
        if (params.notes) updatePayload.description = params.notes;
        if (params.sendToCustomer) updatePayload.auto_advance = "true";

        const invoice = await updateStripeInvoice(
          params.invoiceId,
          updatePayload,
          stripeCreds,
        );

        return {
          id: invoice.id,
          status: invoice.status,
          total: (invoice.total ?? invoice.amount_due) / 100,
          currency: invoice.currency?.toUpperCase(),
          customerId: invoice.customer,
          hostedUrl: invoice.hosted_invoice_url,
        };
      },
      async () => {
        const total = params.lineItems
          ? params.lineItems.reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0,
            )
          : undefined;

        return generateUpdatedInvoice({
          ...params,
          total,
        });
      },
    );
  },
});

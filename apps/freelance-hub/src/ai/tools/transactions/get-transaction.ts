import { tool } from "ai";
import { z } from "zod";
import { generateTransaction } from "@/ai/utils/fake-data";

export const getLedgerEntryTool = tool({
  description: `Get details for a single ledger entry (incoming or outgoing).`,

  inputSchema: z.object({
    id: z.string().describe("Ledger entry ID (UUID)"),
  }),

  execute: async ({ id }) => generateTransaction(id),
});

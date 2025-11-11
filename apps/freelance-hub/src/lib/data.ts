import type { UIMessage } from "@ai-sdk/react";
import { memoryProvider } from "@/ai/agents/shared";

export async function loadChatHistory(
  chatId: string,
  userId: string,
): Promise<UIMessage[]> {
  try {
    if (!memoryProvider.getMessages) {
      return [];
    }

    if (memoryProvider.getChat) {
      const chatMeta = await memoryProvider.getChat(chatId);
      if (chatMeta?.userId && chatMeta.userId !== userId) {
        throw new Error("UNAUTHORIZED_CHAT");
      }
    }

    const messages = await memoryProvider.getMessages({
      chatId,
      limit: 50,
    });

    if (!messages || messages.length === 0) {
      return [];
    }

    return messages;
  } catch (error) {
    console.error("Error loading chat history:", error);
    throw error;
  }
}

import { AIDevtools } from "@ai-sdk-tools/devtools";
import { Provider as ChatProvider } from "@ai-sdk-tools/store";
import { redirect } from "next/navigation";
import { ChatInterface } from "@/components/chat";
import { getCurrentUser } from "@/lib/auth";
import { loadChatHistory } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ chatId?: string[] }>;
};

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const user = await getCurrentUser();

  const currentChatId = resolvedParams.chatId?.at(0);

  if (!user) {
    const nextPath = currentChatId ? `/${currentChatId}` : "/";
    redirect(`/auth?next=${encodeURIComponent(nextPath)}`);
  }

  const sessionUser = user;

  try {
    const initialMessages =
      currentChatId && sessionUser
        ? await loadChatHistory(currentChatId, sessionUser.id)
        : [];

    return (
      <ChatProvider
        key={currentChatId || "home"}
        initialMessages={initialMessages}
      >
        <ChatInterface user={sessionUser} />

        {process.env.NODE_ENV === "development" && <AIDevtools />}
      </ChatProvider>
    );
  } catch {
    // If there's an error loading the chat history, redirect to home
    redirect("/");
  }
}

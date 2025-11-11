import { NextResponse } from "next/server";
import { memoryProvider } from "@/ai/agents/shared";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!memoryProvider.getChats) {
      return NextResponse.json({ chats: [] });
    }

    const chats = await memoryProvider.getChats({
      userId: user.id,
      search,
      limit,
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!memoryProvider.deleteChat) {
      return NextResponse.json(
        { error: "Chat deletion not supported" },
        { status: 501 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      chatId?: string;
    } | null;
    const chatId = body?.chatId;

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 },
      );
    }

    await memoryProvider.deleteChat(chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 },
    );
  }
}

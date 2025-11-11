"use client";

import { generateId } from "ai";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatInterface } from "@/hooks/use-chat-interface";
import { cn } from "@/lib/utils";

interface ChatSession {
  chatId: string;
  userId?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

interface ChatHistoryProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function ChatHistory({ onClose, showCloseButton = false }: ChatHistoryProps) {
  const { chatId: currentChatId, setChatId } = useChatInterface();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchChats = useCallback(async (searchTerm?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) {
        params.set("search", searchTerm);
      }
      params.set("limit", "20");

      const response = await fetch(`/api/chats?${params.toString()}`);
      if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }
      const data = await response.json();
      // Convert ISO strings back to Date objects
      const chatsWithDates = (data.chats || []).map(
        (chat: {
          chatId: string;
          userId?: string;
          title?: string;
          createdAt: string;
          updatedAt: string;
          messageCount: number;
        }) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        }),
      );
      setChats(chatsWithDates);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Skip initial render (handled by initial fetch effect)
    if (search === "") {
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchChats(search);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, fetchChats]);

  // Initial fetch on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleDeleteChat = async (chatId: string) => {
    if (deletingId) return;
    setDeletingId(chatId);
    try {
      const response = await fetch("/api/chats", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }
      setChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
      if (currentChatId === chatId) {
        setChatId(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

const formatDate = (date: Date) => {
  const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      {/* Search */}
      <div className="border-b border-border p-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {showCloseButton && onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {search ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => {
              const isActive = currentChatId === chat.chatId;
              return (
                <div
                  key={chat.chatId}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg p-3 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "hover:bg-accent/60 text-muted-foreground",
                  )}
                >
                  <Link
                    href={`/${chat.chatId}`}
                    className="flex flex-1 items-start gap-3"
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate text-foreground">
                        {chat.title || "New Chat"}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(chat.updatedAt)}</span>
                        {chat.messageCount > 0 && (
                          <>
                            <span>•</span>
                            <span>{chat.messageCount} messages</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-foreground"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Chat options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onCloseAutoFocus={(event) => event.preventDefault()}
                    >
                      <DropdownMenuItem
                        disabled={deletingId === chat.chatId}
                        onSelect={(event) => {
                          event.preventDefault();
                          handleDeleteChat(chat.chatId);
                        }}
                      >
                        {deletingId === chat.chatId ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete chat
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* New Chat Button at Bottom */}
      <div className="border-t border-border p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newChatId = generateId();
            setChatId(newChatId);
          }}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
    </div>
  );
}

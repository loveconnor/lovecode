"use client";

import { ChatTitle } from "./chat-title";

export function ChatHeader() {
  return (
    <div className="flex items-center justify-center relative h-8">
      <ChatTitle />
    </div>
  );
}

"use client";

import { useChatId } from "@ai-sdk-tools/store";
import { useChatActions } from "loveui-ai-tools/client";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useChatInterface } from "@/hooks/use-chat-interface";

const SUGGESTIONS = [
  { toolChoice: "listTalent", text: "Who's free next week?" },
  { toolChoice: "revenue", text: "Show the pipeline pulse" },
  { toolChoice: "listPayouts", text: "Any payouts overdue?" },
  { toolChoice: "startSprint", text: "Kick off a sprint timer" },
  { toolChoice: "businessHealth", text: "How healthy is web ops?" },
  { toolChoice: "listInbox", text: "What's sitting in the inbox?" },
];

type Suggestion = (typeof SUGGESTIONS)[number];

export function SuggestionPills() {
  const { sendMessage } = useChatActions();
  const { setChatId } = useChatInterface();
  const chatId = useChatId();

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (chatId) {
      setChatId(chatId);
    }

    sendMessage({
      text: suggestion.text,
      metadata: {
        toolChoice: suggestion.toolChoice,
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map((suggestion, index) => (
        <motion.div
          key={suggestion.toolChoice}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.2,
            delay: 0.3 + index * 0.05,
            ease: "easeOut",
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestionClick(suggestion)}
            className="rounded-full text-xs font-normal text-muted-foreground/60 hover:bg-accent"
          >
            {suggestion.text}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

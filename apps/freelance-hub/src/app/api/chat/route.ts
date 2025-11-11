import type { AgentEvent } from "@ai-sdk-tools/agents";
import { smoothStream } from "ai";
import type { NextRequest } from "next/server";
import { buildAppContext } from "@/ai/agents/shared";
import { triageAgent } from "@/ai/agents/triage";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase-clients";
import { getUserIntegrations } from "@/lib/user-integrations";
import { getUserPreferences } from "@/lib/user-preferences";
import { checkRateLimit, getClientIP } from "@/lib/rate-limiter";

const MESSAGE_PREVIEW_LIMIT = 160;

const truncate = (text: string): string => {
  if (text.length <= MESSAGE_PREVIEW_LIMIT) {
    return text;
  }
  return `${text.slice(0, MESSAGE_PREVIEW_LIMIT)}…`;
};

const extractMessagePreview = (message: unknown): string => {
  if (!message) return "";

  if (typeof message === "string") {
    return message;
  }

  if (
    typeof message === "object" &&
    message !== null &&
    "text" in message &&
    typeof (message as { text?: string }).text === "string"
  ) {
    return (message as { text: string }).text;
  }

  if (
    typeof message === "object" &&
    message !== null &&
    "parts" in message &&
    Array.isArray((message as { parts?: unknown[] }).parts)
  ) {
    const parts = (
      message as { parts?: Array<{ type?: string; text?: string }> }
    ).parts;
    if (!parts) return "";

    return parts
      .filter(
        (part): part is { type: string; text: string } =>
          !!part && part.type === "text" && typeof part.text === "string",
      )
      .map((part) => part.text)
      .join(" ")
      .trim();
  }

  return "";
};

type LogLevel = "log" | "warn" | "error";

const summarizeAgentEvent = (
  event: AgentEvent,
): { level: LogLevel; message: string; data?: Record<string, unknown> } => {
  switch (event.type) {
    case "start":
      return {
        level: "log",
        message: `agent ${event.agent} received input`,
        data: { preview: truncate(event.input) },
      };
    case "agent-start":
      return {
        level: "log",
        message: `agent ${event.agent} round ${event.round} started`,
      };
    case "agent-step": {
      const step = event.step as Record<string, unknown>;
      const toolCalls = Array.isArray(step?.toolCalls)
        ? (
            step.toolCalls as Array<{ toolName?: string; toolCallId?: string }>
          ).map((call) => ({
            id: call.toolCallId,
            tool: call.toolName,
          }))
        : undefined;
      const finishReason =
        typeof step?.finishReason === "string" ? step.finishReason : undefined;

      return {
        level: "log",
        message: `agent ${event.agent} completed a step`,
        data: {
          toolCalls,
          finishReason,
        },
      };
    }
    case "agent-finish":
      return {
        level: "log",
        message: `agent ${event.agent} finished round ${event.round}`,
      };
    case "agent-handoff":
      return {
        level: "log",
        message: `handoff ${event.from} → ${event.to}`,
        data: event.reason ? { reason: event.reason } : undefined,
      };
    case "handoff":
      return {
        level: "log",
        message: `handoff ${event.from} → ${event.to}`,
        data: event.reason ? { reason: event.reason } : undefined,
      };
    case "tool-call":
      return {
        level: "log",
        message: `tool ${event.toolName} called by ${event.agent}`,
      };
    case "agent-error":
      return {
        level: "error",
        message: "agent orchestration error",
        data: {
          error: event.error?.message || String(event.error),
        },
      };
    case "error":
      return {
        level: "error",
        message: `agent ${event.agent} error`,
        data: { error: event.error?.message || String(event.error) },
      };
    case "agent-complete":
      return {
        level: "log",
        message: `orchestration complete after ${event.totalRounds} round(s)`,
      };
    case "complete":
      return {
        level: "log",
        message: `agent ${event.agent} completed`,
        data: { preview: truncate(event.output) },
      };
    default:
      return {
        level: "log",
        message: `event ${event.type}`,
      };
  }
};

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { success, remaining } = await checkRateLimit(ip);

  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please try again later.",
        remaining,
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Get only the last message from client
  const { message, id, agentChoice, toolChoice, timezone } =
    await request.json();
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const supabase = await getSupabaseRouteHandlerClient();
  const requestId = `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const log = (
    level: LogLevel,
    msg: string,
    data?: Record<string, unknown>,
  ) => {
    const prefix = `[chat-api:${requestId}]`;
    if (level === "warn") {
      data
        ? console.warn(`${prefix} ${msg}`, data)
        : console.warn(`${prefix} ${msg}`);
      return;
    }
    if (level === "error") {
      data
        ? console.error(`${prefix} ${msg}`, data)
        : console.error(`${prefix} ${msg}`);
      return;
    }
    data
      ? console.log(`${prefix} ${msg}`, data)
      : console.log(`${prefix} ${msg}`);
  };

  if (!message) {
    return new Response(JSON.stringify({ error: "No message provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Missing OPENAI_API_KEY. Add it to your environment to enable the agents.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const messagePreview = truncate(extractMessagePreview(message));
  const preferences = await getUserPreferences(user.id, supabase);
  const useDemoData = preferences.useDemoData === true;
  const integrations = useDemoData
    ? {}
    : await getUserIntegrations(user.id, supabase);
  log("log", "Incoming message", {
    chatId: id,
    agentChoice: agentChoice || null,
    toolChoice: toolChoice || null,
    preview: messagePreview,
    timezone,
    userId: user.id,
  });

  const userDisplayName =
    user.email
      .split("@")[0]
      ?.replace(/[\W_]+/g, " ")
      .trim() || user.email;

  const appContext = buildAppContext({
    userId: user.id,
    fullName: userDisplayName,
    companyName: "Campfire Collective",
    baseCurrency: "USD",
    locale: "en-US",
    timezone: timezone || "America/Los_Angeles",
    country: "US",
    city: "Los Angeles",
    region: "California",
    chatId: id,
    integrations,
    demoMode: useDemoData,
  });

  // Pass user preferences to triage agent as context
  // The triage agent will use this information to make better routing decisions
  return triageAgent.toUIMessageStream({
    message,
    strategy: "auto",
    maxRounds: 5,
    maxSteps: 20,
    context: appContext,
    agentChoice,
    toolChoice,
    onEvent: (event) => {
      const summary = summarizeAgentEvent(event);
      log(summary.level, summary.message, summary.data);
    },
    onFinish: async (event) => {
      const assistantMessage =
        event.messages && event.messages.length > 0
          ? event.messages[event.messages.length - 1]
          : null;

      type StreamPart = { type?: string; text?: string };
      const assistantPartsArray = assistantMessage?.parts ?? [];
      const assistantTextParts = assistantPartsArray
        .filter(
          (part): part is StreamPart =>
            typeof part === "object" &&
            part !== null &&
            (part as StreamPart).type === "text",
        )
        .map((part) => part.text ?? "");

      log("log", "Stream finished", {
        responseMessages: event.messages?.length ?? 0,
        assistantParts: assistantPartsArray.map((part) =>
          typeof part === "object" && part !== null
            ? (part as StreamPart).type
            : undefined,
        ),
        assistantTextPreview: assistantTextParts?.join(" ").slice(0, 160),
      });
    },
    onError: (error) => {
      log("error", "Stream error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return "An unexpected error occurred.";
    },
    experimental_transform: smoothStream({
      chunking: "word",
    }),
    sendReasoning: true,
    sendSources: true,
  });
}

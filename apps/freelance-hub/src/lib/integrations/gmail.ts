const GMAIL_API_URL = "https://gmail.googleapis.com/gmail/v1";

export interface GmailCredentials {
  accessToken: string;
}

function ensureGmailToken(overrides?: GmailCredentials) {
  const token = overrides?.accessToken ?? process.env.GMAIL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Gmail integration requires GMAIL_ACCESS_TOKEN.");
  }
  return token;
}

export interface GmailInboxOptions {
  status?: "pending" | "done" | "all";
  limit?: number;
}

export async function fetchGmailInboxMessages(
  options: GmailInboxOptions,
  credentials?: GmailCredentials,
) {
  const token = ensureGmailToken(credentials);
  const queryParts = ["label:inbox"];
  if (options.status === "pending") {
    queryParts.push("is:unread");
  } else if (options.status === "done") {
    queryParts.push("is:read");
  }

  const listResponse = await fetch(
    `${GMAIL_API_URL}/users/me/messages?${new URLSearchParams({
      maxResults: String(options.limit ?? 20),
      q: queryParts.join(" "),
    }).toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!listResponse.ok) {
    const text = await listResponse.text();
    throw new Error(`Gmail list request failed (${listResponse.status}): ${text}`);
  }

  const listData = (await listResponse.json()) as {
    messages?: Array<{ id: string }>;
  };

  if (!listData.messages?.length) return [];

  const messages = await Promise.all(
    listData.messages.map(async (message) => {
      const response = await fetch(
        `${GMAIL_API_URL}/users/me/messages/${message.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as GmailMessage;
      const subject = data.payload?.headers?.find(
        (header) => header.name?.toLowerCase() === "subject",
      )?.value;
      const from = data.payload?.headers?.find(
        (header) => header.name?.toLowerCase() === "from",
      )?.value;
      return {
        id: data.id,
        type: "email",
        status:
          options.status === "done"
            ? "done"
            : options.status === "pending"
              ? "pending"
              : "pending",
        amount: undefined,
        date: new Date(
          data.internalDate ? Number(data.internalDate) : Date.now(),
        )
          .toISOString()
          .split("T")[0],
        description: `${from ?? "Sender"} — ${subject || "(no subject)"}`,
      };
    }),
  );

  return messages.filter(Boolean) as Array<{
    id: string;
    type: string;
    status: string;
    amount?: number;
    date: string;
    description: string;
  }>;
}

type GmailMessage = {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{ name?: string; value?: string }>;
  };
};

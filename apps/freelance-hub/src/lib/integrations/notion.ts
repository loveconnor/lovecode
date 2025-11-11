const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface NotionCredentials {
  apiToken: string;
  databaseId: string;
}

function ensureNotionConfig(overrides?: Partial<NotionCredentials>) {
  const token = overrides?.apiToken ?? process.env.NOTION_API_TOKEN;
  const docsDatabaseId =
    overrides?.databaseId ?? process.env.NOTION_DOCS_DATABASE_ID;

  if (!token || !docsDatabaseId) {
    throw new Error(
      "Notion integration requires NOTION_API_TOKEN and NOTION_DOCS_DATABASE_ID.",
    );
  }

  return { token, docsDatabaseId };
}

async function notionPost(
  path: string,
  body: Record<string, unknown>,
  token: string,
) {
  const response = await fetch(`${NOTION_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion request failed (${response.status}): ${text}`);
  }

  return response.json();
}

export interface NotionDocumentOptions {
  query?: string;
  tags?: string[];
  pageSize?: number;
}

export async function fetchDocumentsFromNotion(
  options: NotionDocumentOptions,
  credentials?: Partial<NotionCredentials>,
) {
  const { token, docsDatabaseId } = ensureNotionConfig(credentials);

  const filter = [];
  if (options.query) {
    filter.push({
      property: "Name",
      rich_text: { contains: options.query },
    });
  }
  if (options.tags?.length) {
    filter.push({
      property: "Tags",
      multi_select: { contains: options.tags[0] },
    });
  }

  const payload = {
    page_size: options.pageSize ?? 20,
    filter: filter.length
      ? {
          and: filter,
        }
      : undefined,
  };

  const response = (await notionPost(
    `/databases/${docsDatabaseId}/query`,
    payload,
    token,
  )) as NotionQueryResponse;

  return response.results.map((page) => ({
    id: page.id,
    name: page.properties?.Name?.title?.[0]?.plain_text ?? "Untitled",
    tags:
      page.properties?.Tags?.multi_select?.map((tag) => tag.name).filter(Boolean) ||
      [],
    uploadedAt: page.last_edited_time,
    url: page.public_url || `https://www.notion.so/${page.id.replace(/-/g, "")}`,
  }));
}

type NotionQueryResponse = {
  results: Array<{
    id: string;
    last_edited_time?: string;
    public_url?: string;
    properties?: Record<
      string,
      {
        title?: Array<{ plain_text?: string }>;
        multi_select?: Array<{ name: string }>;
      }
    >;
  }>;
};

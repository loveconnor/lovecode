import { Buffer } from "node:buffer";

const GREENHOUSE_API_URL = "https://harvest.greenhouse.io/v1";

export interface GreenhouseCredentials {
  apiToken: string;
}

function ensureGreenhouseConfig(overrides?: GreenhouseCredentials) {
  const token = overrides?.apiToken ?? process.env.GREENHOUSE_API_TOKEN;
  if (!token) {
    throw new Error(
      "Greenhouse integration requires GREENHOUSE_API_TOKEN environment variable.",
    );
  }
  return token;
}

async function greenhouseRequest(
  path: string,
  searchParams: Record<string, string | number | undefined> | undefined,
  credentials?: GreenhouseCredentials,
) {
  const token = ensureGreenhouseConfig(credentials);
  const url = new URL(`${GREENHOUSE_API_URL}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${token}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Greenhouse request failed (${response.status}): ${body}`,
    );
  }

  return response.json() as Promise<unknown>;
}

export interface GreenhouseTalentOptions {
  limit?: number;
  tags?: string[];
}

export async function fetchGreenhouseTalent(
  options: GreenhouseTalentOptions,
  credentials?: GreenhouseCredentials,
) {
  const raw = (await greenhouseRequest(
    "/candidates",
    {
      per_page: options.limit ?? 25,
    },
    credentials,
  )) as GreenhouseCandidate[];

  return raw
    .map((candidate) => {
      const latestApplication = candidate.applications?.[0];
      return {
        id: candidate.id,
        name: [candidate.first_name, candidate.last_name]
          .filter(Boolean)
          .join(" "),
        email: candidate.email_addresses?.[0]?.value,
        phone: candidate.phone_numbers?.[0]?.value,
        createdAt: candidate.created_at,
        status: latestApplication?.status,
        tags: candidate.tags || [],
        location: candidate.addresses?.[0]?.value,
        summary: latestApplication?.job_post_id
          ? `Applied for ${latestApplication.job_post_id}`
          : "Active candidate",
        totalRevenue: latestApplication?.prospect_status_id || 0,
        availability: candidate.custom_fields?.availability,
      };
    })
    .filter((candidate) => {
      if (!options.tags?.length) return true;
      return options.tags.every((tag) => candidate.tags?.includes(tag));
    });
}

type GreenhouseCandidate = {
  id: number;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  tags?: string[];
  email_addresses?: Array<{ value?: string }>;
  phone_numbers?: Array<{ value?: string }>;
  addresses?: Array<{ value?: string }>;
  applications?: Array<{
    id: number;
    job_post_id?: number;
    status?: string;
    prospect_status_id?: number;
  }>;
  custom_fields?: {
    availability?: string;
  };
};

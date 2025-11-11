const LINEAR_API_URL = "https://api.linear.app/graphql";

export interface LinearCredentials {
  apiKey: string;
}

function ensureLinearToken(overrides?: LinearCredentials) {
  const token = overrides?.apiKey ?? process.env.LINEAR_API_KEY;
  if (!token) {
    throw new Error("Linear integration requires LINEAR_API_KEY.");
  }
  return token;
}

export interface LinearProjectsOptions {
  status?: "in_progress" | "completed" | "all";
  first?: number;
}

export async function fetchLinearProjects(
  options: LinearProjectsOptions = {},
  credentials?: LinearCredentials,
) {
  const token = ensureLinearToken(credentials);
  const statuses =
    options.status === "completed"
      ? ["Completed"]
      : options.status === "in_progress"
        ? ["Started", "Planned"]
        : undefined;

  const response = await fetch(LINEAR_API_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query Projects($first: Int!, $statuses: [ProjectStatus!]) {
          projects(first: $first, filter: { status: { in: $statuses } }) {
            nodes {
              id
              name
              description
              status
              health
              progress
              updatedAt
              startsAt
              targetDate
            }
          }
        }
      `,
      variables: {
        first: options.first || 25,
        statuses,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Linear request failed (${response.status}): ${text}`);
  }

  const body = (await response.json()) as {
    data: { projects: { nodes: LinearProject[] } };
  };

  return body.data.projects.nodes;
}

type LinearProject = {
  id: string;
  name: string;
  description?: string;
  status?: string;
  health?: string;
  progress?: number;
  updatedAt?: string;
  startsAt?: string;
  targetDate?: string;
};

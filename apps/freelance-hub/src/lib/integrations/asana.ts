const ASANA_API_URL = "https://app.asana.com/api/1.0";

export interface AsanaCredentials {
  accessToken: string;
  workspaceId?: string;
}

function ensureAsanaToken(overrides?: AsanaCredentials) {
  const token = overrides?.accessToken ?? process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Asana integration requires ASANA_ACCESS_TOKEN.");
  }
  return token;
}

export interface AsanaTimeEntryOptions {
  projectId?: string;
  from: string;
  to: string;
  assignee?: string;
}

export async function fetchAsanaTimeEntries(
  options: AsanaTimeEntryOptions,
  credentials?: AsanaCredentials,
) {
  const token = ensureAsanaToken(credentials);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const searchParams = new URLSearchParams({
    opt_fields:
      "name,notes,assignee.name,completed,completed_at,due_on,projects.name",
    limit: "100",
  });

  if (options.projectId) {
    searchParams.set("project", options.projectId);
  }
  if (options.assignee) {
    searchParams.set("assignee", options.assignee);
  }

  let url = `${ASANA_API_URL}/tasks?${searchParams.toString()}`;

  if (!options.projectId) {
    const workspaceId = await resolveWorkspaceId(headers, credentials);
    if (workspaceId) {
      const workspaceSearch = new URLSearchParams({
        opt_fields:
          "name,notes,assignee.name,completed,completed_at,due_on,projects.name",
        limit: "100",
        "modified_at.after": new Date(options.from).toISOString(),
        "modified_at.before": new Date(options.to).toISOString(),
      });
      if (options.assignee) {
        workspaceSearch.set("assignee.any", options.assignee);
      }
      workspaceSearch.set("workspace", workspaceId);
      url = `${ASANA_API_URL}/tasks/search?${workspaceSearch.toString()}`;
    }
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Asana request failed (${response.status}): ${text}`);
  }

  const body = (await response.json()) as {
    data: Array<{
      gid: string;
      name: string;
      notes?: string;
      due_on?: string;
      completed_at?: string;
      assignee?: { name?: string };
      projects?: Array<{ name?: string }>;
    }>;
  };

  const fromDate = new Date(options.from).getTime();
  const toDate = new Date(options.to).getTime();

  return body.data
    .map((task) => ({
      id: task.gid,
      name: task.name,
      project: task.projects?.[0]?.name,
      assignee: task.assignee?.name,
      dueDate: task.due_on,
      completedAt: task.completed_at,
      notes: task.notes,
    }))
    .filter((task) => {
      if (!task.dueDate) return true;
      const timestamp = new Date(task.dueDate).getTime();
      return timestamp >= fromDate && timestamp <= toDate;
    });
}

type AsanaAuthHeaders = {
  Authorization: string;
};

const workspaceCache = new Map<string, string>();

async function resolveWorkspaceId(
  headers: AsanaAuthHeaders,
  credentials?: AsanaCredentials,
): Promise<string | null> {
  if (credentials?.workspaceId) return credentials.workspaceId;
  const cached =
    workspaceCache.get(headers.Authorization) ?? workspaceCache.get("default");
  if (cached) {
    return cached;
  }

  const response = await fetch(`${ASANA_API_URL}/users/me`, { headers });
  if (!response.ok) {
    console.warn(
      "[integration:asana] Unable to resolve workspace",
      await response.text(),
    );
    return null;
  }

  const body = (await response.json()) as {
    data?: { workspaces?: Array<{ gid: string }> };
  };
  const workspaceId = body.data?.workspaces?.[0]?.gid;
  if (workspaceId) {
    workspaceCache.set(headers.Authorization, workspaceId);
    workspaceCache.set("default", workspaceId);
    return workspaceId;
  }
  return null;
}

export interface AsanaProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  status: "in_progress" | "completed";
  progress?: number | null;
  health?: string | null;
  updatedAt?: string | null;
  startsAt?: string | null;
  targetDate?: string | null;
}

export async function fetchAsanaProjects(
  options: { status?: "in_progress" | "completed" | "all" },
  credentials?: AsanaCredentials,
): Promise<AsanaProjectSummary[]> {
  const token = ensureAsanaToken(credentials);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const workspaceId = await resolveWorkspaceId(headers, credentials);
  if (!workspaceId) {
    throw new Error("Unable to determine Asana workspace.");
  }

  const statuses: Array<"in_progress" | "completed"> =
    options.status && options.status !== "all"
      ? [options.status]
      : ["in_progress", "completed"];

  const projects: AsanaProjectSummary[] = [];
  for (const status of statuses) {
    const searchParams = new URLSearchParams({
      workspace: workspaceId,
      limit: "100",
      archived: status === "completed" ? "true" : "false",
      opt_fields:
        "name,notes,archived,current_status.color,current_status.text,modified_at,start_on,due_on,custom_status,completed_at",
    });

    const response = await fetch(
      `${ASANA_API_URL}/projects?${searchParams.toString()}`,
      { headers },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Asana project request failed (${response.status}): ${text}`);
    }

    const body = (await response.json()) as {
      data: Array<{
        gid: string;
        name: string;
        notes?: string;
        archived?: boolean;
        current_status?: { color?: string; text?: string };
        modified_at?: string;
        start_on?: string;
        due_on?: string;
        custom_status?: { color?: string; label?: string };
      }>;
    };

    projects.push(
      ...body.data.map((project) => ({
        id: project.gid,
        name: project.name,
        description: project.notes,
        status: project.archived ? "completed" : "in_progress",
        progress: null,
        health:
          project.current_status?.text ||
          project.current_status?.color ||
          project.custom_status?.label ||
          project.custom_status?.color ||
          null,
        updatedAt: project.modified_at ?? null,
        startsAt: project.start_on ?? null,
        targetDate: project.due_on ?? null,
      })),
    );
  }

  return projects;
}

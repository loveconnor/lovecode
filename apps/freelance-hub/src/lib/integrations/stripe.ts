const STRIPE_API_URL = "https://api.stripe.com/v1";

export interface StripeCredentials {
  secretKey: string;
}

function ensureStripeConfig(overrides?: StripeCredentials) {
  const key = overrides?.secretKey ?? process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Stripe integration requires STRIPE_SECRET_KEY environment variable.",
    );
  }
  return key;
}

async function stripeRequest<T>(
  path: string,
  init?: RequestInit & {
    searchParams?: Record<string, string | number | undefined>;
    credentials?: StripeCredentials;
  },
): Promise<T> {
  const key = ensureStripeConfig(init?.credentials);
  const url = new URL(`${STRIPE_API_URL}${path}`);
  if (init?.searchParams) {
    Object.entries(init.searchParams).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Stripe request failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<T>;
}

export interface StripeInvoiceFilter {
  limit?: number;
  status?: string[];
  created?: {
    start?: string;
    end?: string;
  };
}

export async function listStripeInvoices(
  filter: StripeInvoiceFilter,
  credentials?: StripeCredentials,
) {
  const searchParams: Record<string, string> = {};
  if (filter.limit) searchParams.limit = String(filter.limit);
  if (filter.status && filter.status.length > 0) {
    searchParams.status = filter.status[0];
  }
  if (filter.created?.start || filter.created?.end) {
    if (filter.created.start) {
      searchParams["created[gte]"] = String(
        Math.floor(new Date(filter.created.start).getTime() / 1000),
      );
    }
    if (filter.created.end) {
      searchParams["created[lte]"] = String(
        Math.floor(new Date(filter.created.end).getTime() / 1000),
      );
    }
  }

  const data = await stripeRequest<StripeListResponse<StripeInvoice>>(
    "/invoices",
    { searchParams, credentials },
  );

  return data.data;
}

export async function retrieveStripeInvoice(
  id: string,
  credentials?: StripeCredentials,
) {
  return stripeRequest<StripeInvoice>(`/invoices/${id}`, {
    credentials,
  });
}

export interface CreateStripeInvoiceInput {
  customerId: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  dueDate?: string;
  currency?: string;
  sendImmediately?: boolean;
  notes?: string;
}

export async function createStripeInvoice(
  input: CreateStripeInvoiceInput,
  credentials?: StripeCredentials,
) {
  const currency = (input.currency || "usd").toLowerCase();
  for (const item of input.lineItems) {
    await stripeRequest<StripeInvoiceItem>("/invoiceitems", {
      method: "POST",
      body: new URLSearchParams({
        customer: input.customerId,
        description: item.description,
        amount: String(Math.round(item.unitPrice * item.quantity * 100)),
        currency,
      }).toString(),
      credentials,
    });
  }

  const body = new URLSearchParams({
    customer: input.customerId,
    auto_advance: input.sendImmediately ? "true" : "false",
    collection_method: "send_invoice",
  });

  if (input.dueDate) {
    body.set(
      "due_date",
      String(Math.floor(new Date(input.dueDate).getTime() / 1000)),
    );
  }
  if (input.notes) {
    body.set("description", input.notes);
  }

  const invoice = await stripeRequest<StripeInvoice>(
    "/invoices",
    {
      method: "POST",
      body: body.toString(),
      credentials,
    },
  );

  if (input.sendImmediately) {
    await stripeRequest(`/invoices/${invoice.id}/send`, {
      method: "POST",
      credentials,
    });
  }

  return invoice;
}

export async function updateStripeInvoice(
  id: string,
  body: Record<string, string>,
  credentials?: StripeCredentials,
) {
  return stripeRequest<StripeInvoice>(`/invoices/${id}`, {
    method: "POST",
    body: new URLSearchParams(body).toString(),
    credentials,
  });
}

type StripeListResponse<T> = {
  data: T[];
};

export type StripeInvoice = {
  id: string;
  customer: string | null;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  hosted_invoice_url?: string;
  number?: string;
  created: number;
  description?: string;
  due_date?: number;
  subtotal?: number;
  total?: number;
};

type StripeInvoiceItem = {
  id: string;
};

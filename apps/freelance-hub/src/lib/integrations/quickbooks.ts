const QUICKBOOKS_BASE_URL = "https://quickbooks.api.intuit.com/v3/company";

const REPORT_DEFAULTS = {
  columns: "Money",
  summarize_column_by: "Total",
};

export interface QuickBooksCredentials {
  accessToken: string;
  realmId: string;
}

function ensureQuickBooksConfig(overrides?: QuickBooksCredentials) {
  const realmId = overrides?.realmId ?? process.env.QUICKBOOKS_REALM_ID;
  const accessToken =
    overrides?.accessToken ?? process.env.QUICKBOOKS_ACCESS_TOKEN;

  if (!realmId || !accessToken) {
    throw new Error(
      "QuickBooks integration requires QUICKBOOKS_REALM_ID and QUICKBOOKS_ACCESS_TOKEN.",
    );
  }

  return { realmId, accessToken };
}

async function callQuickBooksReport(
  reportName: string,
  params: Record<string, string | undefined>,
  credentials?: QuickBooksCredentials,
) {
  const { realmId, accessToken } = ensureQuickBooksConfig(credentials);
  const query = new URLSearchParams({
    ...REPORT_DEFAULTS,
    ...params,
  });

  const response = await fetch(
    `${QUICKBOOKS_BASE_URL}/${realmId}/report/${reportName}?${query.toString()}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `QuickBooks ${reportName} request failed (${response.status}): ${body}`,
    );
  }

  return response.json() as Promise<QuickBooksReport>;
}

function extractSummaryValue(
  rows: QuickBooksReportRows | undefined,
): number | undefined {
  if (!rows?.Row) return undefined;
  for (const row of rows.Row) {
    if ("Summary" in row && row.Summary?.ColData?.length) {
      const latest = row.Summary.ColData[row.Summary.ColData.length - 1];
      const value = latest?.value;
      if (value) return Number(value);
    }
  }
  return undefined;
}

function extractBreakdown(
  rows: QuickBooksReportRows | undefined,
  limit = 5,
) {
  if (!rows?.Row) return [];
  const breakdown: Array<{ name: string; amount: number }> = [];

  for (const row of rows.Row) {
    if ("Summary" in row) continue;

    if ("ColData" in row && Array.isArray(row.ColData) && row.ColData.length) {
      const first = row.ColData[0];
      const last = row.ColData[row.ColData.length - 1];
      const name = first?.value;
      const amount = last?.value;
      if (name && amount) {
        breakdown.push({ name, amount: Number(amount) });
      }
    } else if ("Rows" in row && row.Rows?.Row?.length) {
      const nested = extractBreakdown(row.Rows);
      breakdown.push(...nested);
    }
  }

  return breakdown
    .filter((item) => !Number.isNaN(item.amount))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export interface QuickBooksMetricsOptions {
  from?: string;
  to?: string;
  currency?: string;
}

export async function getQuickBooksRevenueMetrics(
  options: QuickBooksMetricsOptions,
  credentials?: QuickBooksCredentials,
) {
  const report = await callQuickBooksReport(
    "ProfitAndLoss",
    {
      start_date: options.from,
      end_date: options.to,
    },
    credentials,
  );

  const total =
    extractSummaryValue(report.Rows) ??
    Number(report?.Header?.EndPeriod?.Amount || 0);
  const breakdown = extractBreakdown(report.Rows);

  return {
    period: {
      from: options.from,
      to: options.to,
    },
    currency:
      options.currency || report.Header?.Currency || report.Header?.HomeCurrency,
    total,
    breakdown: breakdown.length
      ? {
          recurring: breakdown[0]?.amount ?? total * 0.6,
          oneTime:
            total -
            (breakdown[0]?.amount ?? total * 0.6) -
            (breakdown[1]?.amount ?? total * 0.2),
        }
      : {
          recurring: total * 0.7,
          oneTime: total * 0.3,
        },
    growth: {
      percentChange: estimateGrowth(report.Rows),
      trend: growthTrend(estimateGrowth(report.Rows)),
    },
  };
}

function estimateGrowth(rows: QuickBooksReportRows | undefined) {
  if (!rows?.Row) return 0;
  for (const row of rows.Row) {
    if ("Summary" in row) {
      const colData = row.Summary?.ColData;
      if (colData && colData.length >= 2) {
        const first = Number(colData[0]?.value || 0);
        const latest = Number(colData[colData.length - 1]?.value || 0);
        if (first !== 0) {
          return ((latest - first) / Math.abs(first)) * 100;
        }
      }
    }
  }
  return 0;
}

function growthTrend(value: number) {
  if (value > 5) return "increasing";
  if (value < -5) return "decreasing";
  return "stable";
}

type QuickBooksReport = {
  Header?: {
    Currency?: string;
    HomeCurrency?: string;
  };
  Rows?: QuickBooksReportRows;
};

type QuickBooksReportRows = {
  Row?: Array<QuickBooksReportRow>;
};

type QuickBooksReportRow = {
  Summary?: {
    ColData?: Array<{ value?: string }>;
  };
  ColData?: Array<{ value?: string }>;
  Rows?: QuickBooksReportRows;
};

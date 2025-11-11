import { getWriter } from "@ai-sdk-tools/artifacts";
import { tool } from "ai";
import { z } from "zod";
import { RevenueArtifact } from "@/ai/artifacts/revenue";
import { currencyFilterSchema, dateRangeSchema } from "@/ai/types/filters";
import { generateRevenueMetrics } from "@/ai/utils/fake-data";
import { delay } from "@/lib/delay";
import {
  getQuickBooksRevenueMetrics,
  withIntegrationFallback,
} from "@/lib/integrations";

/**
 * Pipeline Dashboard Tool
 *
 * Generates a comprehensive pipeline dashboard with charts and metrics.
 */
export const revenueDashboardTool = tool({
  description: `Generate a pipeline dashboard (bookings, mix, trends) with optional visualization.`,
  inputSchema: dateRangeSchema.merge(currencyFilterSchema).extend({
    useArtifact: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "When the user asks for visual report, use this flag to enable the visualization",
      ),
  }),

  execute: async function* (
    { from, to, currency, useArtifact },
    executionOptions,
  ) {
    try {
      const integrations = (executionOptions?.experimental_context
        ?.integrations ?? {}) as Record<string, Record<string, string>>;
      const demoMode =
        executionOptions?.experimental_context?.demoMode === true;
      const qbCreds = !demoMode ? integrations.quickbooks : undefined;

      const metrics =
        qbCreds?.accessToken && qbCreds.realmId
          ? await withIntegrationFallback(
              "quickbooks",
              () =>
                getQuickBooksRevenueMetrics(
                  { from, to, currency },
                  {
                    accessToken: qbCreds.accessToken,
                    realmId: qbCreds.realmId,
                  },
                ),
              async () => generateRevenueMetrics({ from, to, currency }),
            )
          : generateRevenueMetrics({ from, to, currency });

      if (!useArtifact) {
        yield {
          text: `Pipeline data for ${from} to ${to}: total value ${currency || "USD"} ${metrics.total.toLocaleString()} with momentum ${metrics.growth.percentChange.toFixed(1)}%.`,
        };
        return metrics;
      }

      if (!executionOptions?.experimental_context?.writer) {
        // Fall back gracefully if artifacts context isn't available
        yield {
          text: `Pipeline data for ${from} to ${to}: total value ${currency || "USD"} ${metrics.total.toLocaleString()} with momentum ${metrics.growth.percentChange.toFixed(1)}%. (Visual board unavailable, showing text summary instead.)`,
        };
        return metrics;
      }

      const writer = getWriter(executionOptions);

      // Artifact mode - stream the pipeline dashboard with visualization
      const analysis = RevenueArtifact.stream(
        {
          title: "Pipeline Pulse",
          asOfDate: to,
          stage: "generating",
          progress: 0,
          data: {
            totalRevenue: 0,
            growthRate: 0,
            averageDealSize: 0,
            monthlyRevenue: [],
            revenueByCategory: [],
            quarterlyTrends: [],
            topCustomers: [],
          },
        },
        writer,
      );

      yield { text: `Generating pipeline dashboard for ${from} to ${to}...` };
      await delay(300);

      // Generate realistic fake data for development
      // Generate additional data for the dashboard
      const total = metrics.total || 0;
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthlyRevenue = months.map((month) => ({
        month,
        revenue: Math.floor(total * (0.7 + Math.random() * 0.6)),
        growth: Math.floor((Math.random() - 0.5) * 20),
      }));

      const recurringShare = metrics.breakdown?.recurring ?? total * 0.6;
      const projectShare = metrics.breakdown?.oneTime ?? total * 0.3;

      const revenueByCategory = [
        {
          category: "Retainers",
          revenue: Math.floor(recurringShare),
          percentage: Math.round((recurringShare / total) * 100),
        },
        {
          category: "Campaign Pods",
          revenue: Math.floor(projectShare * 0.5),
          percentage: Math.round(((projectShare * 0.5) / total) * 100),
        },
        {
          category: "Product Sprints",
          revenue: Math.floor(projectShare * 0.3),
          percentage: Math.round(((projectShare * 0.3) / total) * 100),
        },
        {
          category: "Advisory",
          revenue: Math.floor((total - recurringShare - projectShare) * 0.6),
          percentage: Math.round(
            (((total - recurringShare - projectShare) * 0.6) / total) * 100,
          ),
        },
        {
          category: "Other",
          revenue: Math.floor(total * 0.05),
          percentage: 5,
        },
      ];

      const quarterlyTrends = [
        {
          quarter: "Q1",
          revenue: Math.floor(total * 0.22),
          growth: 5.2,
        },
        {
          quarter: "Q2",
          revenue: Math.floor(total * 0.25),
          growth: 8.1,
        },
        {
          quarter: "Q3",
          revenue: Math.floor(total * 0.28),
          growth: 12.3,
        },
        {
          quarter: "Q4",
          revenue: Math.floor(total * 0.25),
          growth: 3.7,
        },
      ];

      const topCustomers = [
        {
          name: "Northwind Ventures",
          revenue: Math.floor(total * 0.15),
          deals: 3,
        },
        {
          name: "Aster Studios",
          revenue: Math.floor(total * 0.12),
          deals: 2,
        },
        {
          name: "Lumen Mobility",
          revenue: Math.floor(total * 0.1),
          deals: 1,
        },
        {
          name: "Analog Supply",
          revenue: Math.floor(total * 0.08),
          deals: 2,
        },
        {
          name: "Vista Labs",
          revenue: Math.floor(total * 0.06),
          deals: 1,
        },
      ];

      // Step 1: Processing revenue data
      await analysis.update({ stage: "generating", progress: 0.2 });
      yield { text: "Calculating pipeline metrics..." };
      await delay(400);

      await analysis.update({
        data: {
          totalRevenue: metrics.total,
          growthRate: metrics.growth.percentChange,
          averageDealSize: Math.floor(metrics.total / 15),
          monthlyRevenue: [],
          revenueByCategory: [],
          quarterlyTrends: [],
          topCustomers: [],
        },
        progress: 0.4,
      });

      // Step 2: Processing monthly trends
      yield { text: "Analyzing monthly trends..." };
      await delay(400);

      await analysis.update({
        data: {
          totalRevenue: metrics.total,
          growthRate: metrics.growth.percentChange,
          averageDealSize: Math.floor(metrics.total / 15),
          monthlyRevenue,
          revenueByCategory: [],
          quarterlyTrends: [],
          topCustomers: [],
        },
        progress: 0.6,
      });

      // Step 3: Processing categories
      yield { text: "Breaking down work type mix..." };
      await delay(400);

      await analysis.update({
        data: {
          totalRevenue: metrics.total,
          growthRate: metrics.growth.percentChange,
          averageDealSize: Math.floor(metrics.total / 15),
          monthlyRevenue,
          revenueByCategory,
          quarterlyTrends: [],
          topCustomers: [],
        },
        progress: 0.8,
      });

      // Step 4: Finalizing
      await analysis.update({ stage: "complete" });
      yield { text: "Finalizing dashboard..." };
      await delay(300);

      // Complete the artifact with all data
      const finalData = {
        title: "Revenue Dashboard",
        asOfDate: to,
        stage: "complete" as const,
        progress: 1,
        data: {
          totalRevenue: metrics.total,
          growthRate: metrics.growth.percentChange,
          averageDealSize: Math.floor(metrics.total / 15),
          monthlyRevenue,
          revenueByCategory,
          quarterlyTrends,
          topCustomers,
        },
      };

      await analysis.complete(finalData);

      return finalData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});

export async function withIntegrationFallback<T>(
  integrationName: string,
  fn: () => Promise<T>,
  fallback: () => Promise<T> | T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn(
      `[integration:${integrationName}] falling back to mock data`,
      error instanceof Error ? error.message : error,
    );
    return await fallback();
  }
}

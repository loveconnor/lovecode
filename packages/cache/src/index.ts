/**
 * @ai-sdk-tools/cache
 * 
 * Simple caching wrapper for LOVEUI AI TOOLS. Cache expensive tool executions 
 * with zero configuration.
 */

export { cached, createCached, cacheTools } from "./cache";
export type {
  CacheOptions,
  CachedTool,
} from "./types";

// Re-export useful types from ai package
export type { Tool } from "ai";

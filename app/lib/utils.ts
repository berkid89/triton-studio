import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ServerStatus = 'connecting' | 'ready' | 'not-ready';

export function getStatusColor(status: ServerStatus): string {
  switch (status) {
    case 'ready':
      return 'bg-[#76b900]';
    case 'not-ready':
      return 'bg-red-500';
    case 'connecting':
    default:
      return 'bg-orange-500';
  }
}

export function getStatusLabel(status: ServerStatus): string {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'not-ready':
      return 'Not Ready';
    case 'connecting':
    default:
      return 'Connecting';
  }
}

/**
 * Get the initial status for a server based on whether it has a metrics URL
 */
export function getInitialServerStatus(hasMetricsUrl: boolean): ServerStatus {
  return hasMetricsUrl ? 'connecting' : 'not-ready';
}

/**
 * Check a server's status by calling the health/ready endpoint
 */
export async function checkServerStatus(
  server: { metrics_url?: string | null },
  useProxy: boolean = true
): Promise<ServerStatus> {
  if (!server.metrics_url) {
    return 'not-ready';
  }

  try {
    // Dynamic import to avoid circular dependencies
    const { TritonApiService } = await import("./triton-api.service");
    const apiService = new TritonApiService(server as any, useProxy);
    const isReady = await apiService.checkHealthReady();
    return isReady ? 'ready' : 'not-ready';
  } catch (error) {
    return 'not-ready';
  }
}

/**
 * Format a date string to a localized string
 */
export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleString();
}

/**
 * Get server URLs in the correct order (HTTP, GRPC, Metrics)
 */
export function getServerUrls(server: {
  http_url?: string | null;
  grpc_inference_url?: string | null;
  metrics_url?: string | null;
}): Array<{ label: string; url: string }> {
  return [
    { label: "HTTP", url: server.http_url },
    { label: "GRPC", url: server.grpc_inference_url },
    { label: "Metrics", url: server.metrics_url },
  ]
    .filter((item): item is { label: string; url: string } => !!item.url);
}

/**
 * Get the color class for a model state
 */
export function getModelStateColor(state: string): string {
  const upperState = state.toUpperCase();
  if (upperState === "READY") {
    return 'bg-[#76b900]';
  } else if (upperState === "UNAVAILABLE") {
    return 'bg-red-500';
  } else {
    return 'bg-orange-500';
  }
}

/**
 * Get the label for a model state
 */
export function getModelStateLabel(state: string): string {
  const upperState = state.toUpperCase();
  if (upperState === "READY") {
    return 'Ready';
  } else if (upperState === "UNAVAILABLE") {
    return 'Unavailable';
  } else {
    return state;
  }
}


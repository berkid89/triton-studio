import type { TritonServer } from "./triton-server.server";

export class TritonApiService {
  private server: TritonServer;
  private useProxy: boolean;

  constructor(server: TritonServer, useProxy: boolean = true) {
    this.server = server;
    this.useProxy = useProxy;
  }

  private async requestMetrics(endpoint: string): Promise<Response> {
    const baseUrl = this.server.metrics_url;
    const url = `${baseUrl}${endpoint}`;
    
    // Use proxy to bypass CORS if enabled
    if (this.useProxy && typeof window !== "undefined") {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      return fetch(proxyUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    
    // Direct request (server-side or if proxy disabled)
    return fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Check if the Triton server is live
   * @returns Promise<boolean> - true if server is live, false otherwise
   */
  async checkHealthLive(): Promise<boolean> {
    try {
      const response = await this.requestMetrics("/health/live");
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if the Triton server is ready
   * @returns Promise<boolean> - true if server is ready, false otherwise
   */
  async checkHealthReady(): Promise<boolean> {
    try {
      const response = await this.requestMetrics("/health/ready");
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}


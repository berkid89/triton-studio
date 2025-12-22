import type { TritonServer } from "./triton-server.server";
import type { Model, ModelInfo } from "~/types";

export class TritonApiService {
  private server: TritonServer;
  private useProxy: boolean;

  constructor(server: TritonServer, useProxy: boolean = true) {
    this.server = server;
    this.useProxy = useProxy;
  }

  private async request(method: string, baseUrl: string, endpoint: string, body?: any): Promise<Response> {
    const url = `${baseUrl}${endpoint}`;
    const bodyString = body ? JSON.stringify(body) : undefined;
    
    // Use proxy to bypass CORS if enabled
    if (this.useProxy && typeof window !== "undefined") {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      return fetch(proxyUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyString,
      });
    }
    
    // Direct request (server-side or if proxy disabled)
    return fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyString,
    });
  }

  /**
   * Check if the Triton server is live
   * @returns Promise<boolean> - true if server is live, false otherwise
   */
  async checkHealthLive(): Promise<boolean> {
    try {
      const response = await this.request("GET", this.server.metrics_url, "/health/live");
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
      const response = await this.request("GET", this.server.metrics_url, "/health/ready");
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getModelList(): Promise<Model[]> {
    try {
      const response = await this.request("POST", this.server.http_url, "/v2/repository/index", {});
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json();
      // Triton API returns { models: [...] } or just an array
      return Array.isArray(data) ? data : (data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  }

  async getModelInfo(modelName: string): Promise<ModelInfo> {
    try {
      const response = await this.request("GET", this.server.http_url, `/v2/models/${modelName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch model info: ${response.statusText}`);
      }
      const data = await response.json();
      return data as ModelInfo;
    } catch (error) {
      console.error("Error fetching model info:", error);
      throw error;
    }
  }
}

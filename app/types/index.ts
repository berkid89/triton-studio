// Domain types - Triton Server related
export type {
  TritonServer,
  CreateTritonServerInput,
  UpdateTritonServerInput,
} from "../lib/triton-server.server";

// Server status types
export type { ServerStatus } from "../lib/utils";

// API types - Triton Inference Server API
export interface Model {
  name: string;
  version: string;
  state: string;
}

export interface ModelInfo {
  name: string;
  versions: string[];
  platform: string;
  inputs: Array<{
    name: string;
    datatype: string;
    shape: number[];
  }>;
  outputs: Array<{
    name: string;
    datatype: string;
    shape: number[];
  }>;
}


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


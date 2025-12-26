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
  platform: string;
  backend: string;
  runtime: string;
  version_policy: {
    all?: {};
    latest?: { num_versions?: number };
    specific?: { versions: number[] };
  };
  max_batch_size: number;
  input: Array<{
    name: string;
    data_type: string;
    format: string;
    dims: number[];
    is_shape_tensor: boolean;
    allow_ragged_batch: boolean;
    optional: boolean;
  }>;
  output: Array<{
    name: string;
    data_type: string;
    dims: number[];
    label_filename: string;
    is_shape_tensor: boolean;
  }>;
  batch_input: Array<{
    kind: string;
    target_name: string[];
    data_type: string;
    source_input: string[];
  }>;
  batch_output: Array<{
    kind: string;
    target_name: string[];
    source_input: string[];
  }>;
  optimization: {
    priority?: string;
    input_pinned_memory?: {
      enable: boolean;
    };
    output_pinned_memory?: {
      enable: boolean;
    };
    gather_kernel_buffer_threshold?: number;
    eager_batching?: boolean;
  };
  instance_group: Array<{
    name: string;
    kind: string;
    count: number;
    gpus: number[];
    secondary_devices?: Array<{
      kind: string;
      device_id: number;
    }>;
    profile?: string[];
    passive?: boolean;
    host_policy?: string;
  }>;
  default_model_filename: string;
  cc_model_filenames: Record<string, string>;
  metric_tags: Record<string, string>;
  parameters: Record<string, string>;
  model_warmup: Array<{
    name: string;
    batch_size?: number;
    inputs?: Record<string, {
      data_type: string;
      dims: number[];
      zero_data?: boolean;
      random_data?: boolean;
      input_data_file?: string;
    }>;
  }>;
}

// Model statistics types
export interface InferenceStat {
  count: number;
  ns: number;
}

export interface InferenceStats {
  success: InferenceStat;
  fail: InferenceStat;
  queue: InferenceStat;
  compute_input: InferenceStat;
  compute_infer: InferenceStat;
  compute_output: InferenceStat;
  cache_hit: InferenceStat;
  cache_miss: InferenceStat;
}

export interface ModelStats {
  name: string;
  version: string;
  last_inference: number;
  inference_count: number;
  execution_count: number;
  inference_stats: InferenceStats;
  batch_stats: unknown[];
  memory_usage: unknown[];
}

export interface ModelStatsResponse {
  model_stats: ModelStats[];
}

export interface ModelInferenceInfo {
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


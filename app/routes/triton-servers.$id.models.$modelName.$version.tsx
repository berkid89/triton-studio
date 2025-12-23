import type { Route } from "./+types/triton-servers.$id.models.$modelName.$version";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getTritonServerById, type TritonServer } from "~/lib/triton-server.server";
import { Link, useLoaderData } from "react-router";
import { getInitialServerStatus, checkServerStatus, type ServerStatus } from "~/lib/utils";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { TritonApiService } from "~/lib/triton-api.service";
import type { ModelInfo, ModelStats } from "~/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData?.server || !loaderData?.modelName) {
    return [
      { title: "Model Not Found - Triton Studio" },
      { name: "description", content: "Model not found" },
    ];
  }
  return [
    { title: `${loaderData.modelName} (v${loaderData.version}) - ${loaderData.server.name} - Triton Studio` },
    { name: "description", content: `Details for model ${loaderData.modelName} version ${loaderData.version} on ${loaderData.server.name}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const serverId = parseInt(params.id as string);
  const modelName = params.modelName as string;
  const version = params.version as string;
  
  if (isNaN(serverId)) {
    throw new Response("Invalid server ID", { status: 400 });
  }

  if (!modelName) {
    throw new Response("Model name is required", { status: 400 });
  }

  if (!version) {
    throw new Response("Model version is required", { status: 400 });
  }

  const server = getTritonServerById(serverId);
  
  if (!server) {
    throw new Response("Server not found", { status: 404 });
  }

  return { server, modelName, version };
}

function formatNanoseconds(ns: number): string {
  if (ns === 0) return "0 ns";
  if (ns < 1000) return `${ns} ns`;
  if (ns < 1_000_000) return `${(ns / 1000).toFixed(2)} μs`;
  if (ns < 1_000_000_000) return `${(ns / 1_000_000).toFixed(2)} ms`;
  return `${(ns / 1_000_000_000).toFixed(2)} s`;
}

function formatTimestamp(timestamp: number): string {
  if (timestamp === 0) return "Never";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

export default function ModelDetail() {
  const { server, modelName, version } = useLoaderData<typeof loader>();
  const [serverStatus, setServerStatus] = useState<ServerStatus>(
    getInitialServerStatus(!!server.metrics_url)
  );
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkServerStatus(server, true);
      setServerStatus(status);
    };

    checkStatus();
  }, [server]);

  const fetchModelInfo = useCallback(async () => {
    if (!server.http_url || serverStatus !== 'ready') {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const apiService = new TritonApiService(server, true);
      const info = await apiService.getModelInfo(modelName, version);
      setModelInfo(info);
    } catch (error) {
      console.error("Failed to fetch model info:", error);
      setError(error instanceof Error ? error.message : "Failed to load model info");
    } finally {
      setLoading(false);
    }
  }, [server, serverStatus, modelName, version]);

  const fetchModelStats = useCallback(async () => {
    if (!server.http_url || serverStatus !== 'ready') {
      return;
    }

    setStatsLoading(true);
    setStatsError(null);
    
    try {
      const apiService = new TritonApiService(server, true);
      const response = await apiService.getModelStats(modelName, version);
      // Find the stats for this specific model version
      const stats = response.model_stats.find(
        (s) => s.name === modelName && s.version === version
      );
      setModelStats(stats || null);
    } catch (error) {
      console.error("Failed to fetch model stats:", error);
      setStatsError(error instanceof Error ? error.message : "Failed to load model stats");
    } finally {
      setStatsLoading(false);
    }
  }, [server, serverStatus, modelName, version]);

  useEffect(() => {
    fetchModelInfo();
  }, [fetchModelInfo]);

  useEffect(() => {
    fetchModelStats();
  }, [fetchModelStats]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/triton-servers/${server.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Server
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                {modelName}
              </h1>
              <p className="mt-2 text-gray-400">
                Version {version} - Model Details on {server.name}
              </p>
            </div>
          </div>
        </div>

        {/* Model Info Card */}
        <div className="bg-[#121212] rounded-lg shadow-sm border border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                Model Information
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Detailed information about the model
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchModelInfo}
              disabled={loading || serverStatus !== 'ready'}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-400">
                Loading model info...
              </span>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-400">
                {error}
              </p>
              {serverStatus !== 'ready' && (
                <p className="mt-2 text-xs text-gray-400">
                  Server must be ready to fetch model info
                </p>
              )}
            </div>
          ) : !modelInfo ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">
                No model information available
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Model Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Model Name
                  </h3>
                  <p className="text-sm text-gray-100">
                    {modelInfo.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Version
                  </h3>
                  <p className="text-sm text-gray-100">
                    {version}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Platform
                  </h3>
                  <p className="text-sm text-gray-100">
                    {modelInfo.platform}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Backend
                  </h3>
                  <p className="text-sm text-gray-100">
                    {modelInfo.backend || "N/A"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Runtime
                  </h3>
                  <p className="text-sm text-gray-100">
                    {modelInfo.runtime || "Default"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Max Batch Size
                  </h3>
                  <p className="text-sm text-gray-100">
                    {modelInfo.max_batch_size || 0}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Default Model Filename
                  </h3>
                  <p className="text-sm text-gray-100">
                    {modelInfo.default_model_filename || "N/A"}
                  </p>
                </div>
              </div>

              {/* Version Policy */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Version Policy
                </h3>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.version_policy?.all ? (
                    <span className="px-3 py-1 bg-[#76b900]/20 text-[#76b900] rounded-md text-sm font-medium">
                      All Versions
                    </span>
                  ) : modelInfo.version_policy?.latest ? (
                    <span className="px-3 py-1 bg-[#76b900]/20 text-[#76b900] rounded-md text-sm font-medium">
                      Latest {modelInfo.version_policy.latest.num_versions ? `(${modelInfo.version_policy.latest.num_versions})` : ""}
                    </span>
                  ) : modelInfo.version_policy?.specific ? (
                    <>
                      {modelInfo.version_policy.specific.versions.map((version, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-md text-sm font-medium"
                        >
                          {version}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">
                      No version policy specified
                    </span>
                  )}
                </div>
              </div>

              {/* Inputs */}
              {modelInfo.input && modelInfo.input.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Inputs
                  </h3>
                  <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Format</TableHead>
                          <TableHead>Dimensions</TableHead>
                          <TableHead>Shape Tensor</TableHead>
                          <TableHead>Ragged Batch</TableHead>
                          <TableHead>Optional</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelInfo.input.map((input, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-gray-100">
                              {input.name}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {input.data_type}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {input.format}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {input.dims ? `[${input.dims.join(", ")}]` : "[]"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {input.is_shape_tensor ? "Yes" : "No"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {input.allow_ragged_batch ? "Yes" : "No"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {input.optional ? "Yes" : "No"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Outputs */}
              {modelInfo.output && modelInfo.output.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Outputs
                  </h3>
                  <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Dimensions</TableHead>
                          <TableHead>Label Filename</TableHead>
                          <TableHead>Shape Tensor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelInfo.output.map((output, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-gray-100">
                              {output.name}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {output.data_type}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {output.dims ? `[${output.dims.join(", ")}]` : "[]"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {output.label_filename || "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {output.is_shape_tensor ? "Yes" : "No"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Instance Groups */}
              {modelInfo.instance_group && modelInfo.instance_group.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Instance Groups
                  </h3>
                  <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Kind</TableHead>
                          <TableHead>Count</TableHead>
                          <TableHead>GPUs</TableHead>
                          <TableHead>Profile</TableHead>
                          <TableHead>Passive</TableHead>
                          <TableHead>Host Policy</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelInfo.instance_group.map((group, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-gray-100">
                              {group.name}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {group.kind}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {group.count}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {group.gpus && group.gpus.length > 0 ? group.gpus.join(", ") : "None"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {group.profile && group.profile.length > 0 ? group.profile.join(", ") : "N/A"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {group.passive ? "Yes" : "No"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {group.host_policy || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Optimization Settings */}
              {modelInfo.optimization && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Optimization Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modelInfo.optimization.priority && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Priority
                        </h4>
                        <p className="text-sm text-gray-100">
                          {modelInfo.optimization.priority}
                        </p>
                      </div>
                    )}
                    {modelInfo.optimization.input_pinned_memory && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Input Pinned Memory
                        </h4>
                        <p className="text-sm text-gray-100">
                          {modelInfo.optimization.input_pinned_memory.enable ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    )}
                    {modelInfo.optimization.output_pinned_memory && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Output Pinned Memory
                        </h4>
                        <p className="text-sm text-gray-100">
                          {modelInfo.optimization.output_pinned_memory.enable ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    )}
                    {modelInfo.optimization.gather_kernel_buffer_threshold !== undefined && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Gather Kernel Buffer Threshold
                        </h4>
                        <p className="text-sm text-gray-100">
                          {modelInfo.optimization.gather_kernel_buffer_threshold}
                        </p>
                      </div>
                    )}
                    {modelInfo.optimization.eager_batching !== undefined && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Eager Batching
                        </h4>
                        <p className="text-sm text-gray-100">
                          {modelInfo.optimization.eager_batching ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Batch Input/Output */}
              {((modelInfo.batch_input && modelInfo.batch_input.length > 0) || 
                (modelInfo.batch_output && modelInfo.batch_output.length > 0)) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Batch Processing
                  </h3>
                  {modelInfo.batch_input && modelInfo.batch_input.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-400 mb-2">
                        Batch Inputs
                      </h4>
                      <div className="text-sm text-gray-400">
                        {modelInfo.batch_input.length} batch input(s) configured
                      </div>
                    </div>
                  )}
                  {modelInfo.batch_output && modelInfo.batch_output.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">
                        Batch Outputs
                      </h4>
                      <div className="text-sm text-gray-400">
                        {modelInfo.batch_output.length} batch output(s) configured
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Parameters */}
              {modelInfo.parameters && Object.keys(modelInfo.parameters).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Parameters
                  </h3>
                  <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(modelInfo.parameters).map(([key, value], index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-gray-100">
                              {key}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Metric Tags */}
              {modelInfo.metric_tags && Object.keys(modelInfo.metric_tags).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">
                    Metric Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(modelInfo.metric_tags).map(([key, value], index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#1a1a1a] text-gray-300 rounded-md text-sm"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Model Stats Card */}
        <div className="bg-[#121212] rounded-lg shadow-sm border border-[#2a2a2a] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                Model Statistics
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Performance metrics and inference statistics
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchModelStats}
              disabled={statsLoading || serverStatus !== 'ready'}
              className="ml-4"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-400">
                Loading model stats...
              </span>
            </div>
          ) : statsError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-400">
                {statsError}
              </p>
              {serverStatus !== 'ready' && (
                <p className="mt-2 text-xs text-gray-400">
                  Server must be ready to fetch model stats
                </p>
              )}
            </div>
          ) : !modelStats ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">
                No model statistics available
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1">
                    Inference Count
                  </h3>
                  <p className="text-2xl font-bold text-gray-100">
                    {modelStats.inference_count.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1">
                    Execution Count
                  </h3>
                  <p className="text-2xl font-bold text-gray-100">
                    {modelStats.execution_count.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1">
                    Last Inference
                  </h3>
                  <p className="text-sm font-medium text-gray-100">
                    {formatTimestamp(modelStats.last_inference)}
                  </p>
                </div>
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 mb-1">
                    Success Rate
                  </h3>
                  <p className="text-2xl font-bold text-gray-100">
                    {modelStats.inference_stats.success.count > 0 || modelStats.inference_stats.fail.count > 0
                      ? `${((modelStats.inference_stats.success.count / (modelStats.inference_stats.success.count + modelStats.inference_stats.fail.count)) * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Inference Stats */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                  Inference Statistics
                </h3>
                <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Count</TableHead>
                        <TableHead>Total Time</TableHead>
                        <TableHead>Avg Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Success
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.success.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.success.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.success.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.success.ns / modelStats.inference_stats.success.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Fail
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.fail.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.fail.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.fail.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.fail.ns / modelStats.inference_stats.fail.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Queue
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.queue.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.queue.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.queue.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.queue.ns / modelStats.inference_stats.queue.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Compute Input
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.compute_input.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.compute_input.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.compute_input.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.compute_input.ns / modelStats.inference_stats.compute_input.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Compute Infer
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.compute_infer.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.compute_infer.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.compute_infer.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.compute_infer.ns / modelStats.inference_stats.compute_infer.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Compute Output
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.compute_output.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.compute_output.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.compute_output.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.compute_output.ns / modelStats.inference_stats.compute_output.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Cache Hit
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.cache_hit.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.cache_hit.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.cache_hit.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.cache_hit.ns / modelStats.inference_stats.cache_hit.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-100">
                          Cache Miss
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.cache_miss.count.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {formatNanoseconds(modelStats.inference_stats.cache_miss.ns)}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {modelStats.inference_stats.cache_miss.count > 0
                            ? formatNanoseconds(modelStats.inference_stats.cache_miss.ns / modelStats.inference_stats.cache_miss.count)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


import type { ModelInfo } from "~/types";
import { RefreshableCard } from "./RefreshableCard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { InfoField } from "./InfoField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { ServerStatus } from "~/lib/utils";

interface ModelInfoCardProps {
  modelInfo: ModelInfo | null;
  version: string;
  loading: boolean;
  error: string | null;
  serverStatus: ServerStatus;
  onRefresh: () => void;
}

export function ModelInfoCard({
  modelInfo,
  version,
  loading,
  error,
  serverStatus,
  onRefresh,
}: ModelInfoCardProps) {
  return (
    <RefreshableCard
      title="Model Information"
      description="Detailed information about the model"
      onRefresh={onRefresh}
      loading={loading}
      disabled={serverStatus !== 'ready'}
    >
      {loading ? (
        <LoadingState message="Loading model info..." />
      ) : error ? (
        <ErrorState
          message={error}
          hint={serverStatus !== 'ready' ? "Server must be ready to fetch model info" : undefined}
        />
      ) : !modelInfo ? (
        <EmptyState message="No model information available" />
      ) : (
        <div className="space-y-6">
          {/* Basic Model Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField label="Model Name" value={modelInfo.name} />
            <InfoField label="Version" value={version} />
            <InfoField label="Platform" value={modelInfo.platform} />
            <InfoField label="Backend" value={modelInfo.backend || "N/A"} />
            <InfoField label="Runtime" value={modelInfo.runtime || "Default"} />
            <InfoField label="Max Batch Size" value={modelInfo.max_batch_size || 0} />
            <InfoField
              label="Default Model Filename"
              value={modelInfo.default_model_filename || "N/A"}
            />
          </div>

          {/* Version Policy */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Version Policy</h3>
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
                  {modelInfo.version_policy.specific.versions.map((v, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-md text-sm font-medium"
                    >
                      {v}
                    </span>
                  ))}
                </>
              ) : (
                <span className="text-sm text-gray-400">No version policy specified</span>
              )}
            </div>
          </div>

          {/* Inputs */}
          {modelInfo.input && modelInfo.input.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Inputs</h3>
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
                        <TableCell className="font-medium text-gray-100">{input.name}</TableCell>
                        <TableCell className="text-gray-400">{input.data_type}</TableCell>
                        <TableCell className="text-gray-400">{input.format}</TableCell>
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
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Outputs</h3>
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
                        <TableCell className="font-medium text-gray-100">{output.name}</TableCell>
                        <TableCell className="text-gray-400">{output.data_type}</TableCell>
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
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Instance Groups</h3>
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
                        <TableCell className="font-medium text-gray-100">{group.name}</TableCell>
                        <TableCell className="text-gray-400">{group.kind}</TableCell>
                        <TableCell className="text-gray-400">{group.count}</TableCell>
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
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Optimization Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modelInfo.optimization.priority && (
                  <InfoField label="Priority" value={modelInfo.optimization.priority} />
                )}
                {modelInfo.optimization.input_pinned_memory && (
                  <InfoField
                    label="Input Pinned Memory"
                    value={modelInfo.optimization.input_pinned_memory.enable ? "Enabled" : "Disabled"}
                  />
                )}
                {modelInfo.optimization.output_pinned_memory && (
                  <InfoField
                    label="Output Pinned Memory"
                    value={modelInfo.optimization.output_pinned_memory.enable ? "Enabled" : "Disabled"}
                  />
                )}
                {modelInfo.optimization.gather_kernel_buffer_threshold !== undefined && (
                  <InfoField
                    label="Gather Kernel Buffer Threshold"
                    value={modelInfo.optimization.gather_kernel_buffer_threshold}
                  />
                )}
                {modelInfo.optimization.eager_batching !== undefined && (
                  <InfoField
                    label="Eager Batching"
                    value={modelInfo.optimization.eager_batching ? "Enabled" : "Disabled"}
                  />
                )}
              </div>
            </div>
          )}

          {/* Batch Input/Output */}
          {((modelInfo.batch_input && modelInfo.batch_input.length > 0) ||
            (modelInfo.batch_output && modelInfo.batch_output.length > 0)) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Batch Processing</h3>
              {modelInfo.batch_input && modelInfo.batch_input.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-400 mb-2">Batch Inputs</h4>
                  <div className="text-sm text-gray-400">
                    {modelInfo.batch_input.length} batch input(s) configured
                  </div>
                </div>
              )}
              {modelInfo.batch_output && modelInfo.batch_output.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">Batch Outputs</h4>
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
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Parameters</h3>
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
                        <TableCell className="font-medium text-gray-100">{key}</TableCell>
                        <TableCell className="text-gray-400">{value}</TableCell>
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
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Metric Tags</h3>
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
    </RefreshableCard>
  );
}


import type { ModelStats } from "~/types";
import { RefreshableCard } from "./RefreshableCard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { formatNanoseconds, formatTimestamp } from "~/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { ServerStatus } from "~/lib/utils";

interface ModelStatsCardProps {
  modelStats: ModelStats | null;
  loading: boolean;
  error: string | null;
  serverStatus: ServerStatus;
  onRefresh: () => void;
}

export function ModelStatsCard({
  modelStats,
  loading,
  error,
  serverStatus,
  onRefresh,
}: ModelStatsCardProps) {
  return (
    <RefreshableCard
      title="Model Statistics"
      description="Performance metrics and inference statistics"
      onRefresh={onRefresh}
      loading={loading}
      disabled={serverStatus !== 'ready'}
    >
      {loading ? (
        <LoadingState message="Loading model stats..." />
      ) : error ? (
        <ErrorState
          message={error}
          hint={serverStatus !== 'ready' ? "Server must be ready to fetch model stats" : undefined}
        />
      ) : !modelStats ? (
        <EmptyState message="No model statistics available" />
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-1">Inference Count</h3>
              <p className="text-2xl font-bold text-gray-100">
                {modelStats.inference_count.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-1">Execution Count</h3>
              <p className="text-2xl font-bold text-gray-100">
                {modelStats.execution_count.toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-1">Last Inference</h3>
              <p className="text-sm font-medium text-gray-100">
                {formatTimestamp(modelStats.last_inference)}
              </p>
            </div>
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-400 mb-1">Success Rate</h3>
              <p className="text-2xl font-bold text-gray-100">
                {modelStats.inference_stats.success.count > 0 ||
                modelStats.inference_stats.fail.count > 0
                  ? `${(
                      (modelStats.inference_stats.success.count /
                        (modelStats.inference_stats.success.count +
                          modelStats.inference_stats.fail.count)) *
                      100
                    ).toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Inference Stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Inference Statistics</h3>
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
                  {[
                    { key: "success", label: "Success", stat: modelStats.inference_stats.success },
                    { key: "fail", label: "Fail", stat: modelStats.inference_stats.fail },
                    { key: "queue", label: "Queue", stat: modelStats.inference_stats.queue },
                    {
                      key: "compute_input",
                      label: "Compute Input",
                      stat: modelStats.inference_stats.compute_input,
                    },
                    {
                      key: "compute_infer",
                      label: "Compute Infer",
                      stat: modelStats.inference_stats.compute_infer,
                    },
                    {
                      key: "compute_output",
                      label: "Compute Output",
                      stat: modelStats.inference_stats.compute_output,
                    },
                    {
                      key: "cache_hit",
                      label: "Cache Hit",
                      stat: modelStats.inference_stats.cache_hit,
                    },
                    {
                      key: "cache_miss",
                      label: "Cache Miss",
                      stat: modelStats.inference_stats.cache_miss,
                    },
                  ].map(({ key, label, stat }) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium text-gray-100">{label}</TableCell>
                      <TableCell className="text-gray-400">
                        {stat.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {formatNanoseconds(stat.ns)}
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {stat.count > 0
                          ? formatNanoseconds(stat.ns / stat.count)
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </RefreshableCard>
  );
}


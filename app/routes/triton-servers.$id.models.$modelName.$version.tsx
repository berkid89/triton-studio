import type { Route } from "./+types/triton-servers.$id.models.$modelName.$version";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getTritonServerById } from "~/lib/triton-server.server";
import { Link, useLoaderData } from "react-router";
import { getInitialServerStatus, checkServerStatus, type ServerStatus } from "~/lib/utils";
import { ArrowLeft, Sidebar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { TritonApiService } from "~/lib/triton-api.service";
import { ModelInfoCard } from "~/components/ModelInfoCard";
import { ModelStatsCard } from "~/components/ModelStatsCard";
import { InferencePanel } from "~/components/InferencePanel";
import type { ModelInfo, ModelStats, ModelInferenceInfo } from "~/types";

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

export default function ModelDetail() {
  const { server, modelName, version } = useLoaderData<typeof loader>();
  const [serverStatus, setServerStatus] = useState<ServerStatus>(
    getInitialServerStatus(!!server.metrics_url)
  );
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [modelInferenceInfo, setModelInferenceInfo] = useState<ModelInferenceInfo | null>(null);
  const [modelStats, setModelStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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

  const fetchModelInferenceInfo = useCallback(async () => {
    if (!server.http_url || serverStatus !== 'ready') {
      return;
    }

    try {
      const apiService = new TritonApiService(server, true);
      const info = await apiService.getModelInferenceInfo(modelName, version);
      setModelInferenceInfo(info);
    } catch (error) {
      console.error("Failed to fetch model inference info:", error);
    }
  }, [server, serverStatus, modelName, version]);

  useEffect(() => {
    fetchModelInfo();
  }, [fetchModelInfo]);

  useEffect(() => {
    fetchModelStats();
  }, [fetchModelStats]);

  useEffect(() => {
    fetchModelInferenceInfo();
  }, [fetchModelInferenceInfo]);

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
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
              <h1 className="text-3xl font-bold text-gray-100">{modelName}</h1>
              <p className="mt-2 text-gray-400">
                Version {version} - Model Details on {server.name}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="ml-4"
          >
            <Sidebar className="h-4 w-4 mr-2" />
            {isPanelOpen ? "Close Panel" : "Open Inference"}
          </Button>
        </div>

        {/* Model Info Card */}
        <ModelInfoCard
          modelInfo={modelInfo}
          version={version}
          loading={loading}
          error={error}
          serverStatus={serverStatus}
          onRefresh={fetchModelInfo}
        />

        {/* Model Stats Card */}
        <ModelStatsCard
          modelStats={modelStats}
          loading={statsLoading}
          error={statsError}
          serverStatus={serverStatus}
          onRefresh={fetchModelStats}
        />
      </div>

      {/* Inference Panel */}
      <InferencePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        modelInferenceInfo={modelInferenceInfo}
        server={server}
        serverStatus={serverStatus}
        modelName={modelName}
        version={version}
      />
    </DashboardLayout>
  );
}


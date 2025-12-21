import type { Route } from "./+types/triton-servers.$id";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getTritonServerById, type TritonServer } from "~/lib/triton-server.server";
import { Link, useLoaderData } from "react-router";
import { getStatusColor, getStatusLabel, getInitialServerStatus, checkServerStatus, formatDate, getModelStateColor, getModelStateLabel, type ServerStatus } from "~/lib/utils";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { TritonApiService } from "~/lib/triton-api.service";
import type { Model } from "~/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function meta({ data }: Route.MetaArgs) {
  if (!data?.server) {
    return [
      { title: "Server Not Found - Triton Studio" },
      { name: "description", content: "Triton Server not found" },
    ];
  }
  return [
    { title: `${data.server.name} - Triton Studio` },
    { name: "description", content: `Details for ${data.server.name}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = parseInt(params.id as string);
  
  if (isNaN(id)) {
    throw new Response("Invalid server ID", { status: 400 });
  }

  const server = getTritonServerById(id);
  
  if (!server) {
    throw new Response("Server not found", { status: 404 });
  }

  return { server };
}

export default function TritonServerDetail() {
  const { server } = useLoaderData<typeof loader>();
  const [serverStatus, setServerStatus] = useState<ServerStatus>(
    getInitialServerStatus(!!server.metrics_url)
  );
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkServerStatus(server, true);
      setServerStatus(status);
    };

    checkStatus();
  }, [server]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!server.http_url || serverStatus !== 'ready') {
        return;
      }

      setModelsLoading(true);
      setModelsError(null);
      
      try {
        const apiService = new TritonApiService(server, true);
        const modelList = await apiService.getModelList();
        setModels(modelList);
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelsError(error instanceof Error ? error.message : "Failed to load models");
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, [server, serverStatus]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/triton-servers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Servers
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {server.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Server Details
              </p>
            </div>
          </div>
        </div>

        {/* Server Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Status
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full ${getStatusColor(serverStatus)}`}
                  title={getStatusLabel(serverStatus)}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {getStatusLabel(serverStatus)}
                </span>
              </div>
            </div>

            {/* Server Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Server Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Server ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {server.id}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {server.name}
                  </p>
                </div>
                {server.created_at && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Created At
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(server.created_at)}
                    </p>
                  </div>
                )}
                {server.updated_at && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Updated At
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(server.updated_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service URLs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                Service URLs
              </h3>
              <div className="space-y-3">
                {server.http_url && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      HTTP Service URL
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={server.http_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400 truncate"
                      >
                        {server.http_url}
                      </a>
                      <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )}
                {server.grpc_inference_url && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      GRPC Service URL
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={server.grpc_inference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400 truncate"
                      >
                        {server.grpc_inference_url}
                      </a>
                      <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )}
                {server.metrics_url && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Metrics Service URL
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={server.metrics_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline dark:text-blue-400 truncate"
                      >
                        {server.metrics_url}
                      </a>
                      <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Models List Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Models
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                List of models available on this server
              </p>
            </div>
          </div>

          {modelsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Loading models...
              </span>
            </div>
          ) : modelsError ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {modelsError}
              </p>
              {serverStatus !== 'ready' && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Server must be ready to fetch models
                </p>
              )}
            </div>
          ) : models.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No models found on this server
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model, index) => (
                  <TableRow key={`${model.name}-${model.version}-${index}`}>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {model.version}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full ${getModelStateColor(model.state)}`}
                          title={getModelStateLabel(model.state)}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getModelStateLabel(model.state)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


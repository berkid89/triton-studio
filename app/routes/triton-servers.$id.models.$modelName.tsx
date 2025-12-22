import type { Route } from "./+types/triton-servers.$id.models.$modelName";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getTritonServerById, type TritonServer } from "~/lib/triton-server.server";
import { Link, useLoaderData } from "react-router";
import { getInitialServerStatus, checkServerStatus, type ServerStatus } from "~/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
import { TritonApiService } from "~/lib/triton-api.service";
import type { ModelInfo } from "~/types";
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
    { title: `${loaderData.modelName} - ${loaderData.server.name} - Triton Studio` },
    { name: "description", content: `Details for model ${loaderData.modelName} on ${loaderData.server.name}` },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const serverId = parseInt(params.id as string);
  const modelName = params.modelName as string;
  
  if (isNaN(serverId)) {
    throw new Response("Invalid server ID", { status: 400 });
  }

  if (!modelName) {
    throw new Response("Model name is required", { status: 400 });
  }

  const server = getTritonServerById(serverId);
  
  if (!server) {
    throw new Response("Server not found", { status: 404 });
  }

  return { server, modelName };
}

export default function ModelDetail() {
  const { server, modelName } = useLoaderData<typeof loader>();
  const [serverStatus, setServerStatus] = useState<ServerStatus>(
    getInitialServerStatus(!!server.metrics_url)
  );
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkServerStatus(server, true);
      setServerStatus(status);
    };

    checkStatus();
  }, [server]);

  useEffect(() => {
    const fetchModelInfo = async () => {
      if (!server.http_url || serverStatus !== 'ready') {
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const apiService = new TritonApiService(server, true);
        const info = await apiService.getModelInfo(modelName);
        setModelInfo(info);
      } catch (error) {
        console.error("Failed to fetch model info:", error);
        setError(error instanceof Error ? error.message : "Failed to load model info");
      } finally {
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, [server, serverStatus, modelName]);

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {modelName}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Model Details on {server.name}
              </p>
            </div>
          </div>
        </div>

        {/* Model Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Model Information
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Detailed information about the model
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Loading model info...
              </span>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
              {serverStatus !== 'ready' && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Server must be ready to fetch model info
                </p>
              )}
            </div>
          ) : !modelInfo ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No model information available
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Model Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    Model Name
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {modelInfo.name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    Platform
                  </h3>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {modelInfo.platform}
                  </p>
                </div>
              </div>

              {/* Versions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                  Versions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {modelInfo.versions && modelInfo.versions.length > 0 ? (
                    modelInfo.versions.map((version, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
                      >
                        {version}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      No versions available
                    </span>
                  )}
                </div>
              </div>

              {/* Inputs */}
              {modelInfo.inputs && modelInfo.inputs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    Inputs
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Shape</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelInfo.inputs.map((input, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-gray-900 dark:text-white">
                              {input.name}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {input.datatype}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {input.shape ? `[${input.shape.join(", ")}]` : "[]"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Outputs */}
              {modelInfo.outputs && modelInfo.outputs.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                    Outputs
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Shape</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modelInfo.outputs.map((output, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-gray-900 dark:text-white">
                              {output.name}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {output.datatype}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {output.shape ? `[${output.shape.join(", ")}]` : "[]"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}


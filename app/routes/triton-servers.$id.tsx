import type { Route } from "./+types/triton-servers.$id";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { getTritonServerById, type TritonServer } from "~/lib/triton-server.server";
import { Link, useLoaderData } from "react-router";
import { getStatusColor, getStatusLabel, getInitialServerStatus, checkServerStatus, formatDate, type ServerStatus } from "~/lib/utils";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkServerStatus(server, true);
      setServerStatus(status);
    };

    checkStatus();
  }, [server]);

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
      </div>
    </DashboardLayout>
  );
}


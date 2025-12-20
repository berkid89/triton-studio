import type { Route } from "./+types/triton-servers";
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { ChevronLeft, ChevronRight, Search, Plus, Edit, Trash2 } from "lucide-react";
import {
  getAllTritonServers,
  createTritonServer,
  updateTritonServer,
  deleteTritonServer,
  type TritonServer,
} from "~/lib/triton-server.server";
import { TritonApiService } from "~/lib/triton-api.service";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const serverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  grpc_inference_url: z
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  http_url: z
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  metrics_url: z
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type ServerFormData = z.infer<typeof serverSchema>;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Triton Servers - Triton Studio" },
    { name: "description", content: "Triton Studio Triton Server Management" },
  ];
}

export async function loader() {
  const servers = getAllTritonServers();
  return { servers };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    const name = formData.get("name") as string;
    const grpc_inference_url = formData.get("grpc_inference_url") as string;
    const http_url = formData.get("http_url") as string;
    const metrics_url = formData.get("metrics_url") as string;

    try {
      serverSchema.parse({ 
        name, 
        grpc_inference_url: grpc_inference_url || undefined,
        http_url: http_url || undefined,
        metrics_url: metrics_url || undefined,
      });
      const server = createTritonServer({ 
        name, 
        grpc_inference_url: grpc_inference_url || undefined,
        http_url: http_url || undefined,
        metrics_url: metrics_url || undefined,
      });
      return { success: true, server, message: "Server created successfully" };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.issues[0].message };
      }
      return { success: false, error: "Failed to create server" };
    }
  }

  if (intent === "update") {
    const id = parseInt(formData.get("id") as string);
    const name = formData.get("name") as string;
    const grpc_inference_url = formData.get("grpc_inference_url") as string;
    const http_url = formData.get("http_url") as string;
    const metrics_url = formData.get("metrics_url") as string;

    try {
      serverSchema.parse({ 
        name, 
        grpc_inference_url: grpc_inference_url || undefined,
        http_url: http_url || undefined,
        metrics_url: metrics_url || undefined,
      });
      const server = updateTritonServer(id, { 
        name, 
        grpc_inference_url: grpc_inference_url || undefined,
        http_url: http_url || undefined,
        metrics_url: metrics_url || undefined,
      });
      if (!server) {
        return { success: false, error: "Server not found" };
      }
      return { success: true, server, message: "Server updated successfully" };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, error: error.issues[0].message };
      }
      return { success: false, error: "Failed to update server" };
    }
  }

  if (intent === "delete") {
    const id = parseInt(formData.get("id") as string);
    const deleted = deleteTritonServer(id);
    if (deleted) {
      return { success: true, message: "Server deleted successfully" };
    }
    return { success: false, error: "Failed to delete server" };
  }

  return { success: false, error: "Invalid action" };
}

export default function TritonServers() {
  const { servers } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [editingServer, setEditingServer] = useState<TritonServer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [serversWithStatus, setServersWithStatus] = useState<TritonServer[]>([]);

  // Initialize servers with status
  const serversData = React.useMemo(() => {
    if (serversWithStatus.length > 0) {
      return serversWithStatus;
    }
    return (servers || []).map(server => ({
      ...server,
      status: (!server.metrics_url ? 'not-ready' : 'connecting') as 'connecting' | 'ready' | 'not-ready',
    }));
  }, [servers, serversWithStatus]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      name: "",
      grpc_inference_url: "",
      http_url: "",
      metrics_url: "",
    },
  });

  const onSubmit = (data: ServerFormData) => {
    const formData = new FormData();
    formData.append("intent", editingServer ? "update" : "create");
    formData.append("name", data.name);
    formData.append("grpc_inference_url", data.grpc_inference_url || "");
    formData.append("http_url", data.http_url || "");
    formData.append("metrics_url", data.metrics_url || "");
    if (editingServer) {
      formData.append("id", editingServer.id.toString());
    }

    fetcher.submit(formData, { method: "post" });
  };

  // Handle successful mutations
  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle") {
      reset();
      setShowForm(false);
      setEditingServer(null);
      setServersWithStatus([]); // Reset to trigger status check on new data
      revalidator.revalidate();
    }
  }, [fetcher.data, fetcher.state, reset, revalidator]);

  // Check server statuses
  useEffect(() => {
    const checkServerStatuses = async () => {
      const serversFromLoader = servers || [];
      
      // Initialize all servers with status
      const initialServers = serversFromLoader.map(server => ({
        ...server,
        status: (!server.metrics_url ? 'not-ready' : 'connecting') as 'connecting' | 'ready' | 'not-ready',
      }));
      setServersWithStatus(initialServers);

      // Check status for each server that has a metrics_url
      const statusChecks = serversFromLoader
        .filter(server => server.metrics_url)
        .map(async (server) => {
          try {
            const apiService = new TritonApiService(server, true); // Use proxy to bypass CORS
            const isReady = await apiService.checkHealthReady();
            return {
              id: server.id,
              status: isReady ? 'ready' as const : 'not-ready' as const,
            };
          } catch (error) {
            return {
              id: server.id,
              status: 'not-ready' as const,
            };
          }
        });

      const results = await Promise.all(statusChecks);
      const updatedServers = initialServers.map(server => {
        const result = results.find(r => r.id === server.id);
        return result ? { ...server, status: result.status } : server;
      });
      setServersWithStatus(updatedServers);
    };

    checkServerStatuses();
  }, [servers]);

  const handleEdit = (server: TritonServer) => {
    setEditingServer(server);
    setValue("name", server.name);
    setValue("grpc_inference_url", server.grpc_inference_url || "");
    setValue("http_url", server.http_url || "");
    setValue("metrics_url", server.metrics_url || "");
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this server?")) {
      const formData = new FormData();
      formData.append("intent", "delete");
      formData.append("id", id.toString());
      fetcher.submit(formData, { method: "post" });
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingServer(null);
  };

  const columns: ColumnDef<TritonServer>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const server = row.original;
        const status = server.status || 'connecting';
        
        const getStatusColor = () => {
          switch (status) {
            case 'ready':
              return 'bg-green-500';
            case 'not-ready':
              return 'bg-red-500';
            case 'connecting':
            default:
              return 'bg-orange-500';
          }
        };

        const getStatusLabel = () => {
          switch (status) {
            case 'ready':
              return 'Ready';
            case 'not-ready':
              return 'Not Ready';
            case 'connecting':
            default:
              return 'Connecting';
          }
        };

        return (
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getStatusColor()}`}
              title={getStatusLabel()}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {getStatusLabel()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      id: "urls",
      header: "Urls",
      cell: ({ row }) => {
        const { grpc_inference_url, http_url, metrics_url } = row.original;
        const urls = [
          { label: "GRPC", url: grpc_inference_url },
          { label: "HTTP", url: http_url },
          { label: "Metrics", url: metrics_url },
        ].filter((item): item is { label: string; url: string } => !!item.url);

        if (urls.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        return (
          <div className="flex flex-col gap-1">
            {urls.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400 text-sm"
              >
                {item.label}: {item.url}
              </a>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const server = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(server)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(server.id)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: serversData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Triton Servers
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your Triton inference servers.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Server
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingServer ? "Edit Server" : "Add New Server"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Server Name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grpc_inference_url">GRPC Inference Service URL</Label>
                  <Input
                    id="grpc_inference_url"
                    {...register("grpc_inference_url")}
                    placeholder="grpc://example.com:8001"
                  />
                  {errors.grpc_inference_url && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.grpc_inference_url.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="http_url">HTTP Service URL</Label>
                  <Input
                    id="http_url"
                    {...register("http_url")}
                    placeholder="http://example.com:8000"
                  />
                  {errors.http_url && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.http_url.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metrics_url">Metrics Service URL</Label>
                  <Input
                    id="metrics_url"
                    {...register("metrics_url")}
                    placeholder="http://example.com:8002/metrics"
                  />
                  {errors.metrics_url && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.metrics_url.message}
                    </p>
                  )}
                </div>
              </div>
              {fetcher.data && !fetcher.data.success && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fetcher.data.error}
                </p>
              )}
              {fetcher.data && fetcher.data.success && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  {fetcher.data.message}
                </p>
              )}
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={fetcher.state === "submitting"}>
                  {fetcher.state === "submitting"
                    ? "Saving..."
                    : editingServer
                    ? "Update"
                    : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={fetcher.state === "submitting"}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search servers..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("name")?.setFilterValue(e.target.value)
              }
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No servers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

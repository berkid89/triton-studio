import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("triton-servers", "routes/triton-servers.tsx"),
  route("triton-servers/:id", "routes/triton-servers.$id.tsx"),
  route("triton-servers/:id/models/:modelName/:version", "routes/triton-servers.$id.models.$modelName.$version.tsx"),
  route("api/proxy", "routes/api.proxy.ts"),
] satisfies RouteConfig;

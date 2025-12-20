import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("settings", "routes/settings.tsx"),
  route("triton-servers", "routes/triton-servers.tsx"),
  route("api/proxy", "routes/api.proxy.ts"),
] satisfies RouteConfig;

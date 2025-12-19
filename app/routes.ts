import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("users", "routes/users.tsx"),
  route("forms", "routes/forms.tsx"),
  route("profile", "routes/profile.tsx"),
  route("settings", "routes/settings.tsx"),
  route("triton-servers", "routes/triton-servers.tsx"),
] satisfies RouteConfig;

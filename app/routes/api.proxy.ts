import type { Route } from "./+types/api.proxy";

/**
 * Generic proxy endpoint to bypass CORS
 * Usage: /api/proxy?url=<encoded-url>
 * Supports both GET (via loader) and POST/PUT/DELETE (via action)
 */
async function proxyRequest(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return Response.json({ error: "url parameter is required" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(targetUrl);
    
    // Security: Only allow http/https URLs
    if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
      return Response.json({ error: "Invalid URL protocol" }, { status: 400 });
    }

    // Get request body if present
    let body: string | undefined;
    const contentType = request.headers.get("Content-Type");
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.text();
    }

    const response = await fetch(decodedUrl, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        ...(contentType && { "Content-Type": contentType }),
      },
      body: body || undefined,
    });

    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    return Response.json({ 
      error: "Failed to proxy request",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  return proxyRequest(request);
}

export async function action({ request }: Route.ActionArgs) {
  return proxyRequest(request);
}


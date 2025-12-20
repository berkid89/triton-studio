import type { Route } from "./+types/api.proxy";

/**
 * Generic proxy endpoint to bypass CORS
 * Usage: /api/proxy?url=<encoded-url>
 */
export async function loader({ request }: Route.LoaderArgs) {
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

    const response = await fetch(decodedUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
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


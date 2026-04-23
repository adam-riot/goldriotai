// Cloudflare Pages Function — handles all HTTP methods
export async function onRequest(context) {
  const { request, env } = context;
  
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 200, headers: corsHeaders } // Return 200 to avoid CORS issues
    );
  }

  // Check API key
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY tidak diset dalam Cloudflare Pages → Settings → Variables and Secrets." }),
      { status: 200, headers: corsHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body: " + e.message }),
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-5",
        max_tokens: body.max_tokens || 1500,
        messages: body.messages || [],
      }),
    });

    const text = await res.text();
    return new Response(text, { status: 200, headers: corsHeaders });

  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Fetch error: " + e.message }),
      { status: 200, headers: corsHeaders }
    );
  }
}

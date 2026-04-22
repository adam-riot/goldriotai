export async function onRequestPost(context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  const apiKey = context.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({
      error: "ANTHROPIC_API_KEY tidak ada dalam Cloudflare Pages environment variables."
    }), { status: 500, headers });
  }

  let body;
  try {
    body = await context.request.json();
  } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid request body: " + e.message }), { status: 400, headers });
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

    const responseText = await res.text();
    
    if (!res.ok) {
      return new Response(JSON.stringify({ 
        error: "Anthropic API error " + res.status + ": " + responseText.slice(0, 500)
      }), { status: res.status, headers });
    }

    return new Response(responseText, { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

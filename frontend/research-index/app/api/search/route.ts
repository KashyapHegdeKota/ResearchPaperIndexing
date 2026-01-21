export async function POST(req: Request) {
  const backend = process.env.BACKEND_ORIGIN;
  if (!backend) {
    return new Response("Missing BACKEND_ORIGIN env var", { status: 500 });
  }

  const bodyText = await req.text(); // preserves raw body
  const upstreamRes = await fetch(`${backend}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyText,
    cache: "no-store",
  });

  const contentType = upstreamRes.headers.get("content-type") || "application/json";
  const text = await upstreamRes.text();

  return new Response(text, {
    status: upstreamRes.status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
    },
  });
}

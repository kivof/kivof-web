export function GET() {
  return Response.json(
    { status: "ok", service: "kivof-web" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

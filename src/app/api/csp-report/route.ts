import { boundedText } from "@/lib/api/boundary";
export async function POST(request: Request) {
  try {
    const raw = JSON.parse(await boundedText(request, 8192));
    const report = raw["csp-report"];
    const directive =
      typeof report?.["effective-directive"] === "string"
        ? report["effective-directive"].slice(0, 100)
        : "unknown";
    console.warn(JSON.stringify({ event: "csp_violation", directive }));
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}

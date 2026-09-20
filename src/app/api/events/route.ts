import type { NextRequest } from "next/server";
import { config } from "@/lib/config";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  const settings = config();
  const token = request.cookies.get(settings.cookieName)?.value;
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });
  if (!settings.events)
    return Response.json({ error: "configuration_missing" }, { status: 503 });
  let socket: WebSocket | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const encoder = new TextEncoder();
  const close = () => {
    if (heartbeat) clearInterval(heartbeat);
    socket?.close();
  };
  const stream = new ReadableStream({
    start(controller) {
      let finished = false;
      const send = (event: string, data: string) => {
        if (finished) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${data}\n\n`),
          );
        } catch {
          finished = true;
          close();
        }
      };
      socket = new WebSocket(settings.events as string);
      socket.addEventListener("open", () =>
        socket?.send(JSON.stringify({ type: "authenticate", token })),
      );
      socket.addEventListener("message", (message) => {
        if (typeof message.data !== "string" || message.data.length > 131072)
          return;
        try {
          send("telemetry", JSON.stringify(JSON.parse(message.data)));
        } catch {
          send("status", '{"state":"invalid_frame"}');
        }
      });
      socket.addEventListener("error", () =>
        send("status", '{"state":"disconnected"}'),
      );
      socket.addEventListener("close", () => {
        if (!finished) {
          finished = true;
          close();
          controller.close();
        }
      });
      heartbeat = setInterval(() => send("heartbeat", "{}"), 20000);
      request.signal.addEventListener(
        "abort",
        () => {
          finished = true;
          close();
          try {
            controller.close();
          } catch {
            /* Already closed by the transport. */
          }
        },
        { once: true },
      );
    },
    cancel: close,
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

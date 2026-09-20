"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { bindVoiceConnection } from "./voiceConnection";
import { releaseVoice, transcriptEvent } from "./voiceEvents";
import { voiceOpening } from "./voiceOpening";
import { voiceToolHandler } from "./voiceTools";
export function useVoice(
  onTranscript: (role: "user" | "assistant", text: string) => void,
) {
  const [phase, setPhase] = useState<
    "idle" | "connecting" | "active" | "error"
  >("idle");
  const peer = useRef<RTCPeerConnection | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const generation = useRef(0);
  const toolsAbort = useRef<AbortController | null>(null);
  const callback = useRef(onTranscript);
  callback.current = onTranscript;
  function cleanup() {
    generation.current++;
    toolsAbort.current?.abort();
    toolsAbort.current = null;
    releaseVoice(stream.current, peer.current, audio.current);
    stream.current = null;
    peer.current = null;
    audio.current = null;
  }
  function stop() {
    cleanup();
    setPhase("idle");
  }
  async function start(locale: string) {
    cleanup();
    const current = generation.current;
    setPhase("connecting");
    try {
      const session = await api<{
        client_secret?: { value?: string };
        value?: string;
        url?: string;
        context?: unknown;
      }>("realtime/session", { locale });
      const token = session.client_secret?.value ?? session.value;
      if (!token || !session.url || new URL(session.url).protocol !== "https:")
        throw new Error("invalid_session");
      if (generation.current !== current) return;
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation.current !== current) {
        media.getTracks().forEach((track) => {
          track.stop();
        });
        return;
      }
      stream.current = media;
      const pc = new RTCPeerConnection();
      peer.current = pc;
      const player = new Audio();
      player.autoplay = true;
      audio.current = player;
      bindVoiceConnection(
        pc,
        player,
        () => generation.current === current,
        () => setPhase("active"),
        () => {
          cleanup();
          setPhase("error");
        },
      );
      media.getTracks().forEach((track) => {
        pc.addTrack(track, media);
      });
      const channel = pc.createDataChannel("oai-events");
      const controller = new AbortController();
      toolsAbort.current = controller;
      const active = () =>
        generation.current === current && channel.readyState === "open";
      channel.onopen = () => {
        if (!active()) return;
        for (const event of voiceOpening(session.context, locale))
          channel.send(JSON.stringify(event));
      };
      const transportFailed = () => {
        if (generation.current !== current) return;
        cleanup();
        setPhase("error");
      };
      channel.onerror = transportFailed;
      channel.onclose = transportFailed;
      const handleTools = voiceToolHandler({
        active,
        execute: (call) =>
          api(
            "assistant/tools",
            call,
            AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
          ),
        send: (event) => channel.send(JSON.stringify(event)),
        changed: (value) => {
          if (!value || typeof value !== "object") return;
          const envelope = value as Record<string, unknown>;
          const result = envelope.result as { id?: unknown } | undefined;
          if (
            envelope.ok !== true ||
            typeof result?.id !== "string" ||
            !/^[A-Za-z0-9_-]{1,128}$/.test(result.id)
          )
            return;
          void api(`simulation/live/${result.id}`, undefined, controller.signal)
            .then((scene) => {
              if (active())
                window.dispatchEvent(
                  new CustomEvent("kivof:live-session", { detail: scene }),
                );
            })
            .catch(() => {
              if (active())
                window.dispatchEvent(new Event("kivof:workspace-changed"));
            });
        },
      });
      channel.onmessage = (event) => {
        try {
          if (
            generation.current !== current ||
            typeof event.data !== "string" ||
            event.data.length > 200000
          )
            return;
          const value = JSON.parse(event.data);
          if (value?.type === "error") {
            cleanup();
            setPhase("error");
            return;
          }
          const transcript = transcriptEvent(value);
          if (transcript) callback.current(transcript.role, transcript.text);
          void handleTools(value).catch(() => {
            if (active()) {
              cleanup();
              setPhase("error");
            }
          });
        } catch {
          setPhase("error");
          cleanup();
        }
      };
      const offer = await pc.createOffer();
      if (generation.current !== current) return;
      await pc.setLocalDescription(offer);
      if (generation.current !== current) return;
      const response = await fetch(session.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(20000),
        ]),
      });
      if (!response.ok) throw new Error("negotiation_failed");
      const sdp = await response.text();
      if (generation.current !== current) return;
      await pc.setRemoteDescription({ type: "answer", sdp });
    } catch {
      if (generation.current === current) {
        cleanup();
        setPhase("error");
      }
    }
  }
  useEffect(
    () => () => {
      generation.current++;
      toolsAbort.current?.abort();
      releaseVoice(stream.current, peer.current, audio.current);
    },
    [],
  );
  return { phase, start, stop };
}

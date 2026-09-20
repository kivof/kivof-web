"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { releaseVoice, transcriptEvent } from "./voiceEvents";
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
  const callback = useRef(onTranscript);
  callback.current = onTranscript;
  function cleanup() {
    generation.current++;
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
      pc.ontrack = (event) => {
        player.srcObject = event.streams[0];
        void player.play().catch(() => {
          cleanup();
          setPhase("error");
        });
      };
      media.getTracks().forEach((track) => {
        pc.addTrack(track, media);
      });
      const channel = pc.createDataChannel("oai-events");
      channel.onmessage = (event) => {
        try {
          const value = JSON.parse(event.data);
          const transcript = transcriptEvent(value);
          if (transcript) callback.current(transcript.role, transcript.text);
        } catch {
          setPhase("error");
          cleanup();
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setPhase("active");
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          cleanup();
          setPhase("error");
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const response = await fetch(session.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
        body: offer.sdp,
        signal: AbortSignal.timeout(20000),
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
      releaseVoice(stream.current, peer.current, audio.current);
    },
    [],
  );
  return { phase, start, stop };
}

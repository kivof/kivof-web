export function transcriptEvent(
  value: unknown,
): { role: "user" | "assistant"; text: string } | null {
  if (!value || typeof value !== "object") return null;
  const event = value as Record<string, unknown>;
  if (typeof event.transcript !== "string" || event.transcript.length > 20000)
    return null;
  if (event.type === "conversation.item.input_audio_transcription.completed")
    return { role: "user", text: event.transcript };
  if (
    event.type === "response.output_audio_transcript.done" ||
    event.type === "response.audio_transcript.done"
  )
    return { role: "assistant", text: event.transcript };
  return null;
}
export function releaseVoice(
  stream: Pick<MediaStream, "getTracks"> | null,
  peer: Pick<RTCPeerConnection, "close"> | null,
  audio: Pick<HTMLAudioElement, "pause" | "srcObject"> | null,
) {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
  peer?.close();
  if (audio) {
    audio.pause();
    audio.srcObject = null;
  }
}

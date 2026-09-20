export function bindVoiceConnection(
  peer: Pick<
    RTCPeerConnection,
    "ontrack" | "onconnectionstatechange" | "connectionState"
  >,
  player: Pick<HTMLAudioElement, "srcObject" | "play">,
  current: () => boolean,
  connected: () => void,
  failed: () => void,
) {
  peer.ontrack = (event) => {
    if (!current()) return;
    player.srcObject = event.streams[0];
    void player.play().catch(() => {
      if (current()) failed();
    });
  };
  peer.onconnectionstatechange = () => {
    if (!current()) return;
    if (peer.connectionState === "connected") connected();
    if (
      peer.connectionState === "failed" ||
      peer.connectionState === "disconnected"
    )
      failed();
  };
}

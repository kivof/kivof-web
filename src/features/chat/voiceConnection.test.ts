import assert from "node:assert/strict";
import { test } from "node:test";
import { bindVoiceConnection } from "./voiceConnection";

test("old peer state and delayed audio failures cannot close a newer voice session", async () => {
  let current = true;
  let failed = 0;
  let connected = 0;
  let rejectPlayback: (error: Error) => void = () => {};
  const playback = new Promise<void>((_resolve, reject) => {
    rejectPlayback = reject;
  });
  const connection = {
    connectionState: "new" as RTCPeerConnectionState,
    ontrack: null,
    onconnectionstatechange: null,
  };
  const peer = connection as unknown as RTCPeerConnection;
  const player = { srcObject: null, play: () => playback };
  bindVoiceConnection(
    peer,
    player,
    () => current,
    () => {
      connected += 1;
    },
    () => {
      failed += 1;
    },
  );
  peer.ontrack?.call(peer, { streams: [{}] } as unknown as RTCTrackEvent);
  current = false;
  rejectPlayback(new Error("old audio blocked"));
  await Promise.resolve();
  connection.connectionState = "disconnected";
  peer.onconnectionstatechange?.call(peer, new Event("connectionstatechange"));
  connection.connectionState = "connected";
  peer.onconnectionstatechange?.call(peer, new Event("connectionstatechange"));
  assert.equal(failed, 0);
  assert.equal(connected, 0);
  current = true;
  peer.onconnectionstatechange?.call(peer, new Event("connectionstatechange"));
  assert.equal(connected, 1);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { liveSessionContext } from "./liveSessionContext";

test("transient context snapshot errors never terminate the existing live session", () => {
  for (const live of [
    [],
    [{ id: "owned", status: "unavailable" }],
    [{ id: "other", status: "stopped" }],
  ])
    assert.equal(
      liveSessionContext({ current_live_session: null, live }, "owned").state,
      "unavailable",
    );
  assert.equal(
    liveSessionContext(
      {
        current_live_session: null,
        live: [{ id: "owned", status: "stopped" }],
      },
      "owned",
    ).state,
    "stopped",
  );
  assert.equal(
    liveSessionContext({ current_live_session: null }, null).state,
    "empty",
  );
});

test("only bounded active session identifiers can be adopted", () => {
  assert.deepEqual(
    liveSessionContext({ current_live_session: "owned-1" }, null),
    { state: "active", id: "owned-1" },
  );
  for (const value of [
    null,
    [],
    {},
    { current_live_session: "../other" },
    { current_live_session: "https://other" },
  ])
    assert.equal(liveSessionContext(value, null).state, "unavailable");
});

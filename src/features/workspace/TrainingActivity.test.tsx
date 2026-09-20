import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { dictionaries } from "@/lib/i18n";
import type { Run } from "@/lib/models/domain";
import { TrainingActivity, trainingProgress } from "./TrainingActivity";
import { trainingLabels } from "./trainingLabels";

test("training progress comes from reported steps and never estimates missing work", () => {
  assert.equal(trainingProgress(), null);
  assert.deepEqual(
    trainingProgress({ status: "running", request: { steps: 4 } }),
    {
      steps: 4,
      done: null,
      loss: null,
    },
  );
  assert.deepEqual(
    trainingProgress({
      status: "running",
      request: { steps: 4 },
      output: { steps_completed: 2, metrics: { loss: [0.8, 0.4] } },
    }),
    { steps: 4, done: 2, loss: 0.4 },
  );
  for (const steps_completed of [-1, 5, Infinity, 0.5])
    assert.equal(
      trainingProgress({
        status: "running",
        request: { steps: 4 },
        output: { steps_completed },
      })?.done,
      null,
    );
});

test("training monitor labels actual source frames and idle state in every language", () => {
  const source = {
    id: "a".repeat(64),
    source: "isaac-sim",
    evidence: {
      frames: [
        {
          source: "isaac-sim",
          media_type: "image/png",
          simulation_time_s: 2,
          sha256: "b".repeat(64),
          data_url: "data:image/png;base64,iVBORw0KGgoAAA==",
        },
      ],
    },
  } as unknown as Run;
  for (const locale of ["en", "es", "de", "fr"] as const) {
    const labels = trainingLabels(locale);
    const idle = renderToStaticMarkup(
      <TrainingActivity
        native
        locale={locale}
        source={source}
        lossLabel={dictionaries[locale].loss}
      />,
    );
    assert.match(idle, /data-training-status="idle"/);
    assert.ok(idle.includes(labels.ready));
    assert.ok(idle.includes(labels.native));
    assert.match(idle, /data-native-source="run"/);
    assert.doesNotMatch(idle, /<progress/);
    assert.equal(
      Object.keys(labels).length,
      Object.keys(trainingLabels("en")).length,
    );
    const running = renderToStaticMarkup(
      <TrainingActivity
        native
        locale={locale}
        source={source}
        lossLabel={dictionaries[locale].loss}
        status={dictionaries[locale].running}
        job={{
          status: "running",
          request: { steps: 4 },
          output: { steps_completed: 2, metrics: { loss: [0.8, 0.4] } },
        }}
      />,
    );
    assert.match(running, /data-training-status="running"/);
    assert.match(running, /max="4" value="2"/);
    assert.ok(running.includes(labels.progress));
  }
});

test("missing native source is actionable and synthetic training has no robot-frame substitute", () => {
  const labels = trainingLabels("en");
  const native = renderToStaticMarkup(
    <TrainingActivity native locale="en" lossLabel="Loss" />,
  );
  assert.ok(native.includes(labels.noSource));
  assert.match(native, /href="\/workspace\/simulation"/);
  const synthetic = renderToStaticMarkup(
    <TrainingActivity native={false} locale="en" lossLabel="Loss" />,
  );
  assert.ok(synthetic.includes(labels.synthetic));
  assert.doesNotMatch(synthetic, /<img|<progress/);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { liveLabels } from "./liveLabels";
import { RobotInspector } from "./RobotInspector";

test("selected robot renders seven measured joints in every locale", () => {
  for (const locale of ["en", "es", "de", "fr"] as const) {
    const labels = liveLabels(locale);
    const html = renderToStaticMarkup(
      <RobotInspector
        locale={locale}
        labels={labels}
        onFocus={() => {}}
        robot={{
          id: "franka-4",
          model: "Franka Panda",
          joint_names: Array.from({ length: 7 }, (_, i) => `j${i}`),
          joint_positions: Array(7).fill(0.321),
          joint_velocities: Array(7).fill(0.123),
          position: [0, 0, 0],
          screen: [0.5, 0.5],
        }}
      />,
    );
    assert.equal((html.match(/<tr>/g) ?? []).length, 8);
    assert.ok(html.includes("franka-4"));
    assert.ok(html.includes(labels.joints));
    assert.ok(html.includes(new Intl.NumberFormat(locale).format(0.321)));
    assert.equal(
      Object.keys(labels).length,
      Object.keys(liveLabels("en")).length,
    );
  }
});

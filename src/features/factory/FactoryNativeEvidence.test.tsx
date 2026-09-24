import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { dictionaries, type Locale } from "@/lib/i18n";
import { factoryCopy } from "./copy";
import { FactoryNativeEvidence } from "./FactoryNativeEvidence";
import { FactoryPanel } from "./FactoryPanel";

test("factory offers explicit CPU and Isaac choices with CPU selected by default", () => {
  const html = renderToStaticMarkup(<FactoryPanel />);
  assert.match(html, /<option value="cpu" selected="">/);
  assert.match(html, /<option value="isaac">/);
  assert.ok(html.includes(factoryCopy.en.nativeRequestNote) === false);
});
test("native frame is withheld until integrity verification and measured fields are localized", () => {
  for (const locale of ["en", "es", "de", "fr"] as Locale[]) {
    const copy = { ...dictionaries[locale], ...factoryCopy[locale] };
    const html = renderToStaticMarkup(
      <FactoryNativeEvidence
        locale={locale}
        copy={copy}
        native={{
          frames: [
            {
              dataUrl: "data:image/png;base64,unused",
              sha256: "0".repeat(64),
              width: 1,
              height: 1,
              time: 1.5,
            },
          ],
          samples: [],
          distance: 0.02,
          speed: 0.01,
          released: true,
          lifted: true,
        }}
      />,
    );
    assert.ok(html.includes(copy.frameChecking));
    assert.ok(html.includes(copy.distanceToBin));
    assert.equal(html.includes("<img"), false);
  }
});

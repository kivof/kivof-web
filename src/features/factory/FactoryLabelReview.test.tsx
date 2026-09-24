import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { dictionaries, type Locale } from "@/lib/i18n";
import type { FactoryRecord } from "@/lib/models/factory";
import { factoryCopy } from "./copy";
import { FactoryLabelReview } from "./FactoryLabelReview";

test("review form offers thirteen translated classes, source boundary and a required note", () => {
  const record = {
    id: "record-1",
    revision: 1,
    review: null,
    reviews: [],
    labels: [
      { label: "hard_cheese", status: "unreviewed", training_eligible: false },
    ],
  } as unknown as FactoryRecord;
  for (const locale of ["en", "es", "de", "fr"] as Locale[]) {
    const copy = { ...dictionaries[locale], ...factoryCopy[locale] };
    const html = renderToStaticMarkup(
      <FactoryLabelReview
        record={record}
        copy={copy}
        locale={locale}
        onReviewed={() => {}}
      />,
    );
    assert.equal((html.match(/<option/g) ?? []).length, 13);
    assert.ok(html.includes(copy.humanReview));
    assert.ok(html.includes(copy.reviewBoundary.replaceAll("’", "’")));
    assert.ok(html.includes("required"));
    assert.ok(html.includes("disabled"));
  }
});

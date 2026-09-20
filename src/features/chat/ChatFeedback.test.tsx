import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { dictionaries, type Locale } from "@/lib/i18n";
import { ChatFeedback } from "./ChatFeedback";
import { chatCopy } from "./copy";

const ready = {
  loading: false,
  modelsError: false,
  historyError: false,
  error: "",
  retry: () => {},
};

test("startup recovery explains each failure in every supported language", () => {
  for (const locale of ["en", "es", "de", "fr"] as Locale[]) {
    const t = chatCopy[locale];
    assert.deepEqual(Object.keys(t), Object.keys(chatCopy.en));
    for (const key of Object.keys(chatCopy.en)) assert.ok(t[key]?.trim());
    for (const failure of ["modelsError", "historyError"] as const) {
      const html = renderToStaticMarkup(
        <ChatFeedback
          locale={locale}
          copy={dictionaries[locale]}
          state={{ ...ready, [failure]: true }}
        />,
      );
      assert.ok(
        html.includes(t[failure === "modelsError" ? "models" : "history"]),
      );
      assert.ok(html.includes(t.retry));
      assert.match(html, /role="alert"/);
      assert.doesNotMatch(html, /disabled/);
    }
  }
});

test("expired authentication has a recovery link and upstream text is never rendered", () => {
  const render = (error: string) =>
    renderToStaticMarkup(
      <ChatFeedback
        locale="en"
        copy={dictionaries.en}
        state={{ ...ready, error }}
      />,
    );
  assert.match(render("unauthorized"), /href="\/login"/);
  assert.ok(render("origin_rejected").includes(chatCopy.en.origin));
  assert.ok(render("provider_unavailable").includes(chatCopy.en.provider));
  assert.ok(render("review_rejected").includes(chatCopy.en.rejected));
  assert.doesNotMatch(
    render("<script>untrusted upstream error</script>"),
    /script|upstream/,
  );
});

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import styles from "./ChatStyles.module.css";
import { chatCopy } from "./copy";

type FeedbackState = {
  loading: boolean;
  modelsError: boolean;
  historyError: boolean;
  error: string;
  retry: () => void;
};

export function ChatFeedback({
  state,
  locale,
  copy,
}: {
  state: FeedbackState;
  locale: Locale;
  copy: Record<string, string>;
}) {
  const t = chatCopy[locale];
  const messages: Record<string, string> = {
    unauthorized: t.session,
    origin_rejected: t.origin,
    provider_unavailable: t.provider,
    review_rejected: t.rejected,
    model_unavailable_or_output_rejected: copy.modelUnavailable,
    rate_limited: copy.rateLimited,
  };
  return (
    <>
      {state.loading && <output className={styles.working}>{t.loading}</output>}
      {(state.modelsError || state.historyError) && (
        <div role="alert" className={styles.error}>
          <p>{state.modelsError ? t.models : t.history}</p>
          <button type="button" onClick={state.retry} disabled={state.loading}>
            {t.retry}
          </button>
        </div>
      )}
      {state.error && (
        <div role="alert" className={styles.error}>
          <p>{messages[state.error] ?? copy.error}</p>
          {state.error === "unauthorized" && (
            <Link href="/login">{t.signIn}</Link>
          )}
        </div>
      )}
    </>
  );
}

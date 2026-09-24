// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnswerBlocks } from "@/components/ui/data-display/AnswerBlocks/AnswerBlocks";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { ChatFeedback } from "./ChatFeedback";
import { ChatImage } from "./ChatImage";
import { ChatProgress } from "./ChatProgress";
import styles from "./ChatStyles.module.css";
import { useChat } from "./useChat";
export function Chat({ compact = false }: { compact?: boolean }) {
  const { t, locale } = usePreferences();
  const state = useChat(locale);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);
  const bottom = useRef<HTMLDivElement>(null);
  const activeVoice =
    state.voice.phase === "active" || state.voice.phase === "connecting";
  useEffect(() => {
    if (state.turns.length || state.busy)
      bottom.current?.scrollIntoView({ block: "nearest" });
  }, [state.turns.length, state.busy]);
  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || state.busy || !state.model || state.loading) return;
    const submitted = input;
    void state.send(submitted).then((sent) => {
      if (sent) setInput((current) => (current === submitted ? "" : current));
    });
  }
  return (
    <div className={styles.chat} data-compact={compact}>
      <header>
        <div>
          <span className={styles.logo}>K</span>
          <strong>Kivof {t.chat}</strong>
        </div>
        <button
          type="button"
          title={t.clearHistory}
          aria-label={t.clear}
          onClick={() => void state.clear()}
        >
          <Icon name="plus" size={18} />
        </button>
      </header>
      <div className={styles.messages} aria-live="polite">
        {state.turns.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyLogo}>
              <Icon name="bolt" size={30} />
            </span>
            <h2>{t.assistantTitle}</h2>
            <p>{t.assistantBody}</p>
            <div className={styles.suggestions}>
              {["suggest1", "suggest2", "suggest3"].map((key, i) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setInput(t[key])}
                >
                  <Icon
                    name={i === 0 ? "activity" : i === 1 ? "grid" : "graph"}
                    size={17}
                  />
                  <span>{t[key]}</span>
                  <Icon name="arrow" size={15} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          state.turns.map((turn) => (
            <article
              className={styles.turn}
              data-role={turn.role}
              key={turn.id}
            >
              <div className={styles.turnMeta}>
                <span>{turn.role === "assistant" ? "Kivof" : t.operator}</span>
                {turn.voice && <Icon name="mic" size={12} />}
                <small>{turn.reply?.model}</small>
              </div>
              <p className={styles.answer}>{turn.content}</p>
              {turn.reply && (
                <>
                  <AnswerBlocks
                    components={turn.reply.components}
                    evidence={turn.reply.evidence}
                    copy={t}
                  />
                  {(turn.reply.image || turn.imageId) && (
                    <ChatImage
                      image={turn.reply.image}
                      imageId={turn.imageId}
                    />
                  )}
                  {turn.reply.reviewed && (
                    <p className={styles.reviewed}>{t.reviewed}</p>
                  )}
                  {turn.reply.summary.length > 0 && (
                    <details className={styles.reasoning}>
                      <summary>
                        <Icon name="shield" size={13} />
                        {t.reasoning}
                      </summary>
                      <ul>
                        {turn.reply.summary.map((item, i) => (
                          <li key={item + i}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  {turn.reply.evidence.length > 0 && (
                    <details className={styles.reasoning}>
                      <summary>
                        {t.sources} · {turn.reply.evidence.length}
                      </summary>
                      {turn.reply.evidence.map((item) => (
                        <p key={item.id}>
                          {item.label}
                          <small>{item.locator}</small>
                        </p>
                      ))}
                    </details>
                  )}
                </>
              )}
            </article>
          ))
        )}
        {state.busy && <ChatProgress stages={state.stages} copy={t} />}
        <div ref={bottom} />
      </div>
      <div className={styles.composerWrap}>
        <ChatFeedback state={state} locale={locale} copy={t} />
        {menuOpen && (
          <fieldset className={styles.actionMenu} id={menuId}>
            <legend>{t.chatActions}</legend>
            <button
              type="button"
              onClick={() => {
                setInput(t.suggest1);
                setMenuOpen(false);
              }}
            >
              <Icon name="shield" size={16} />
              <span>
                {t.explainSkill}
                <small>{t.evidence}</small>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInput(`/image ${input.replace(/^\/image\s*/, "")}`);
                setMenuOpen(false);
              }}
            >
              <Icon name="image" size={16} />
              <span>
                {t.image}
                <small>{t.generated}</small>
              </span>
            </button>
          </fieldset>
        )}
        {activeVoice && (
          <output className={styles.voiceStatus}>
            <Icon name="mic" size={15} />
            {state.voice.phase === "connecting" ? t.connecting : t.listening}
            <button type="button" onClick={state.voice.stop} title={t.endVoice}>
              <Icon name="close" size={16} />
            </button>
          </output>
        )}
        {state.voice.phase === "error" && (
          <p role="alert" className={styles.error}>
            {t.voiceError}
          </p>
        )}
        <form className={styles.composer} onSubmit={submit}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                submit();
              }
            }}
            aria-label={t.message}
            placeholder={t.placeholder}
            maxLength={12000}
            rows={2}
          />
          <div className={styles.toolbar}>
            <button
              type="button"
              title={t.chatActions}
              aria-label={t.chatActions}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name="plus" size={18} />
            </button>
            <button
              type="button"
              title={activeVoice ? t.endVoice : t.voice}
              aria-label={activeVoice ? t.endVoice : t.voice}
              data-active={activeVoice}
              onClick={() =>
                activeVoice
                  ? state.voice.stop()
                  : void state.voice.start(locale)
              }
            >
              <Icon name={activeVoice ? "stop" : "mic"} size={17} />
            </button>
            <select
              aria-label={t.model}
              value={state.model}
              onChange={(e) => state.setModel(e.target.value)}
              disabled={state.busy || !state.models.length}
              title={t.model}
            >
              {!state.models.length && (
                <option value="">{t.modelsUnavailable}</option>
              )}
              {state.models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.label}
                </option>
              ))}
            </select>
            {state.busy ? (
              <button
                className={styles.send}
                type="button"
                aria-label={t.stop}
                title={t.stop}
                onClick={state.stop}
              >
                <Icon name="stop" size={16} />
              </button>
            ) : (
              <button
                className={styles.send}
                type="submit"
                disabled={!input.trim() || !state.model || state.loading}
                title={t.send}
                aria-label={t.send}
              >
                <Icon name="send" size={17} />
              </button>
            )}
          </div>
        </form>
        <p className={styles.note}>{t.sessionOnly}</p>
      </div>
    </div>
  );
}

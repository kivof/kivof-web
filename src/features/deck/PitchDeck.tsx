"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { startDemoSession } from "@/lib/api/auth";
import type { Locale } from "@/lib/i18n";
import { deckContent, deckLabels, type Slide } from "./content";
import chrome from "./DeckChromeStyles.module.css";
import { DeckSlide } from "./DeckSlide";
import styles from "./PitchDeckStyles.module.css";
import type { DeckLabels } from "./types";

function useDeckNavigation(total: number) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "input,select,textarea,button,a,[contenteditable=true]",
        )
      )
        return;
      const change =
        event.key === "ArrowRight" || event.key === " "
          ? 1
          : event.key === "ArrowLeft"
            ? -1
            : 0;
      if (change) {
        event.preventDefault();
        setIndex((value) => Math.max(0, Math.min(total - 1, value + change)));
      }
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(total - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);
  return { index, setIndex };
}
export function DeckPages({
  slides,
  index,
  locale,
  labels,
  sessionStarted,
  startWorkspace,
}: {
  slides: Slide[];
  index: number;
  locale: Locale;
  labels: DeckLabels;
  sessionStarted?: boolean;
  startWorkspace?: () => Promise<void>;
}) {
  return (
    <>
      <main className={styles.active}>
        <DeckSlide
          key={slides[index].id}
          slide={slides[index]}
          index={index}
          total={slides.length}
          locale={locale}
          labels={labels}
          active
          sessionStarted={sessionStarted}
          startWorkspace={startWorkspace}
        />
      </main>
      <div className={styles.print} aria-hidden="true">
        {slides.map((slide, i) => (
          <DeckSlide
            key={slide.id}
            slide={slide}
            index={i}
            total={slides.length}
            locale={locale}
            labels={labels}
            active={false}
          />
        ))}
      </div>
    </>
  );
}
export function PitchDeck() {
  const { locale, t } = usePreferences();
  const slides = deckContent[locale],
    labels = deckLabels[locale];
  const { index, setIndex } = useDeckNavigation(slides.length);
  const [error, setError] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  async function startWorkspace() {
    if (!sessionStarted) {
      await startDemoSession();
      setSessionStarted(true);
    }
  }
  return (
    <div className={styles.page}>
      <header className={chrome.header}>
        <Link href="/" className={chrome.brand}>
          kivof<span>·</span>
        </Link>
        <span>{slides[0].label}</span>
        <div>
          <Preferences />
          <button
            type="button"
            title={t.fullscreen}
            aria-label={t.fullscreen}
            onClick={() =>
              void document.documentElement
                .requestFullscreen()
                .catch(() => setError(true))
            }
          >
            <Icon name="expand" size={17} />
          </button>
          <button
            type="button"
            title={t.print}
            aria-label={t.print}
            onClick={() => window.print()}
          >
            <Icon name="image" size={17} />
          </button>
        </div>
      </header>
      <DeckPages
        slides={slides}
        index={index}
        locale={locale}
        labels={labels}
        sessionStarted={sessionStarted}
        startWorkspace={startWorkspace}
      />
      {error && <p role="alert">{t.error}</p>}
      <nav className={chrome.controls} aria-label={t.deck}>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          disabled={index === 0}
          aria-label={t.previous}
        >
          ←
        </button>
        <label>
          <span>{labels.jump}</span>
          <select
            value={index}
            onChange={(event) => setIndex(Number(event.target.value))}
            aria-label={labels.jump}
          >
            {slides.map((slide, i) => (
              <option key={slide.id} value={i}>
                {String(i + 1).padStart(2, "0")} ·{" "}
                {slide.title.replaceAll("\n", " ")}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() =>
            setIndex((value) => Math.min(value + 1, slides.length - 1))
          }
          disabled={index === slides.length - 1}
          aria-label={t.next}
        >
          →
        </button>
        <span className={chrome.keyboard}>{labels.keyboard}</span>
        <Link href="/login">
          {t.openDemo}
          <Icon name="arrow" size={17} />
        </Link>
      </nav>
    </div>
  );
}

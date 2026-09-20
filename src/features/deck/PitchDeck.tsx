"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { RobotScene } from "@/components/ui/data-display/RobotScene/RobotScene";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { deckContent, type Slide } from "./content";
import styles from "./PitchDeckStyles.module.css";

function Visual({ slide }: { slide: Slide }) {
  const { t } = usePreferences();
  if (slide.visual === "cell" || slide.visual === "proof")
    return <RobotScene title={t.sceneTitle} caption={t.sceneCaption} />;
  return (
    <div className={styles.visual}>
      {slide.visual === "layers"
        ? [
            "Web",
            "Rust backend",
            "OpenClaw",
            "Rust inference core",
            "Local controller",
          ].map((label, i) => (
            <div key={label}>
              <span>0{i + 1}</span>
              <strong>{label}</strong>
              <Icon name={i === 4 ? "shield" : "chevron"} />
            </div>
          ))
        : ["flow1", "flow2", "flow3", "flow4"].map((key, i) => (
            <div key={key}>
              <span>0{i + 1}</span>
              <strong>{t[key]}</strong>
              <Icon name="arrow" />
            </div>
          ))}
    </div>
  );
}
function DeckSlide({ slide, index }: { slide: Slide; index: number }) {
  return (
    <section className={styles.slide}>
      <div className={styles.copy}>
        <span className={styles.label}>{slide.label}</span>
        <h1>{slide.title}</h1>
        <p>{slide.body}</p>
        <ul>
          {slide.points.map((point) => (
            <li key={point}>
              <span />
              {point}
            </li>
          ))}
        </ul>
      </div>
      <Visual slide={slide} />
      <footer>
        <p>{slide.note}</p>
        <span>{String(index + 1).padStart(2, "0")} / 08</span>
      </footer>
    </section>
  );
}
export function PitchDeck() {
  const { locale, t } = usePreferences();
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(false);
  const slides = deckContent[locale];
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLButtonElement ||
        event.target instanceof HTMLAnchorElement
      )
        return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        setIndex((value) => Math.min(value + 1, slides.length - 1));
      }
      if (event.key === "ArrowLeft")
        setIndex((value) => Math.max(value - 1, 0));
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [slides.length]);
  return (
    <div className={styles.page}>
      <header>
        <Link href="/" className={styles.brand}>
          kivof.
        </Link>
        <span>HARNESS FORGE / THEKER</span>
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
      <main className={styles.active}>
        <DeckSlide slide={slides[index]} index={index} />
      </main>
      <div className={styles.print}>
        {slides.map((slide, i) => (
          <DeckSlide slide={slide} index={i} key={slide.label} />
        ))}
      </div>
      {error && <p role="alert">{t.error}</p>}
      <nav className={styles.controls} aria-label={t.deck}>
        <button
          type="button"
          onClick={() => setIndex((value) => Math.max(value - 1, 0))}
          disabled={index === 0}
          aria-label={t.previous}
        >
          ←
        </button>
        <div>
          {slides.map((slide, i) => (
            <button
              type="button"
              key={slide.label}
              aria-label={`${t.slide} ${i + 1}`}
              aria-current={i === index ? "step" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
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
        <Link href="/login">
          {t.openDemo}
          <Icon name="arrow" size={17} />
        </Link>
      </nav>
    </div>
  );
}

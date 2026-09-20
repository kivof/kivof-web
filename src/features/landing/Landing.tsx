"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { RobotScene } from "@/components/ui/data-display/RobotScene/RobotScene";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import styles from "./LandingStyles.module.css";
export function Landing() {
  const { t } = usePreferences();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span>K</span>kivof<span className={styles.brandDot}>.</span>
        </Link>
        <nav>
          <Link href="/deck/JO202609190900">{t.deck}</Link>
          <Preferences />
          <Link className={styles.smallButton} href="/login">
            {t.signIn}
            <Icon name="arrow" size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span /> {t.eyebrow}
            </span>
            <h1>
              {t.hero1}
              <br />
              <em>{t.hero2}</em>
            </h1>
            <p>{t.heroBody}</p>
            <div className={styles.actions}>
              <Link href="/login" className={styles.primary}>
                {t.openDemo}
                <Icon name="arrow" />
              </Link>
              <Link href="/deck/JO202609190900">
                {t.deck}
                <Icon name="chevron" size={15} />
              </Link>
            </div>
            <div className={styles.trust}>
              <Icon name="shield" size={17} />
              {t.localAuthority}
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.visualBar}>
              <span>{t.sceneTitle}</span>
              <Badge tone="good">{t.simulationBadge}</Badge>
            </div>
            <RobotScene title={t.sceneTitle} caption={t.sceneCaption} />
            <div className={styles.flow}>
              {["flow1", "flow2", "flow3", "flow4"].map((key, index) => (
                <div key={key}>
                  <span>0{index + 1}</span>
                  {t[key]}
                  {index < 3 && <Icon name="arrow" size={15} />}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className={styles.features}>
          {[1, 2, 3].map((index) => (
            <article key={index}>
              <div className={styles.featureNumber}>0{index}</div>
              <h2>{t[`feature${index}`]}</h2>
              <p>{t[`feature${index}Body`]}</p>
            </article>
          ))}
        </section>
        <section className={styles.control}>
          <div>
            <span className={styles.eyebrow}>KIVOF / THEKER</span>
            <h2>{t.controlTitle}</h2>
            <p>{t.controlBody}</p>
          </div>
          <Link href="/login" className={styles.primary}>
            {t.openDemo}
            <Icon name="arrow" />
          </Link>
        </section>
      </main>
      <footer>
        <span>kivof.</span>
        <p>{t.footer}</p>
        <span>01 / 2026</span>
      </footer>
    </div>
  );
}

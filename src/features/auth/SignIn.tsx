"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheeseLine } from "@/components/ui/data-display/CheeseLine/CheeseLine";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import styles from "./SignInStyles.module.css";
export function SignIn() {
  const { t } = usePreferences();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await api("auth/login", { email, password });
      setPassword("");
      router.push("/workspace");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className={styles.page}>
      <header>
        <Link href="/">
          <Icon name="arrow" />
          kivof.
        </Link>
        <Preferences />
      </header>
      <div className={styles.layout}>
        <section className={styles.visual}>
          <span>{t.eyebrow}</span>
          <h1>{t.signInTitle}</h1>
          <CheeseLine copy={t} />
          <p>{t.localAuthority}</p>
        </section>
        <section className={styles.formPanel}>
          <span className={styles.mark}>K</span>
          <h2>{t.signIn}</h2>
          <p>{t.signInBody}</p>
          <form onSubmit={submit}>
            <label>
              {t.email}
              <input
                type="email"
                required
                autoComplete="username"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              {t.password}
              <input
                type="password"
                required
                autoComplete="current-password"
                maxLength={256}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className={styles.error}>
                {t.authError}
              </p>
            )}
            <button disabled={busy} type="submit">
              {busy ? t.loading : t.signIn}
              <Icon name="arrow" />
            </button>
          </form>
          <small>{t.simNote}</small>
        </section>
      </div>
    </main>
  );
}

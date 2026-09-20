"use client";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { dictionaries, type Locale } from "@/lib/i18n";
import styles from "./PreferencesStyles.module.css";

const Context = createContext({
  locale: "en" as Locale,
  t: dictionaries.en,
  theme: "light",
  setLocale: (_locale: Locale) => {},
  toggle: () => {},
});
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [locale, setLanguage] = useState<Locale>("en");
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const language = localStorage.getItem("kivof-language");
    if (language && language in dictionaries) setLanguage(language as Locale);
    setTheme(
      localStorage.getItem("kivof-theme") ??
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    );
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker
        .register("/sw.js")
        .catch(() => console.warn("Offline shell registration failed"));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
  }, [theme, locale]);
  const setLocale = (value: Locale) => {
    setLanguage(value);
    localStorage.setItem("kivof-language", value);
  };
  const toggle = () => {
    const value = theme === "dark" ? "light" : "dark";
    setTheme(value);
    localStorage.setItem("kivof-theme", value);
  };
  return (
    <Context.Provider
      value={{ locale, t: dictionaries[locale], theme, setLocale, toggle }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePreferences() {
  return useContext(Context);
}
export function Preferences() {
  const { locale, t, theme, setLocale, toggle } = usePreferences();
  return (
    <div className={styles.controls}>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t.language}
        title={t.language}
      >
        <option value="en">EN</option>
        <option value="es">ES</option>
        <option value="de">DE</option>
        <option value="fr">FR</option>
      </select>
      <button
        type="button"
        onClick={toggle}
        title={theme === "dark" ? t.light : t.dark}
        aria-label={theme === "dark" ? t.light : t.dark}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
      </button>
    </div>
  );
}

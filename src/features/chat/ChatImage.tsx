"use client";
import { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import { parseReply, type Reply } from "@/lib/models/chat";
import styles from "./ChatStyles.module.css";
export function ChatImage({
  image,
  imageId,
}: {
  image?: Reply["image"];
  imageId?: string;
}) {
  const { t } = usePreferences();
  const [loaded, setLoaded] = useState(image);
  const [failed, setFailed] = useState(false);
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    if (loaded || !imageId || !element.current) return;
    let active = true;
    let requested = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || requested) return;
        requested = true;
        void api<{ image: unknown }>(
          `chat/${encodeURIComponent(imageId)}/image`,
        )
          .then((raw) =>
            parseReply({
              id: imageId,
              answer: "",
              model: "saved",
              image: raw.image,
            }),
          )
          .then((reply) => {
            if (active) setLoaded(reply.image);
          })
          .catch(() => {
            if (active) setFailed(true);
          });
      },
      { rootMargin: "200px" },
    );
    observer.observe(element.current);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [imageId, loaded]);
  return (
    <figure className={styles.image} ref={element}>
      {loaded ? (
        <>
          {/* biome-ignore lint/performance/noImgElement: Authenticated in-memory image cannot use a public optimizer. */}
          <img
            src={`data:${loaded.mime_type};base64,${loaded.data}`}
            alt={t.generated}
          />
          <figcaption>{t.generated}</figcaption>
          <a
            download="kivof-illustration.png"
            href={`data:${loaded.mime_type};base64,${loaded.data}`}
          >
            {t.export}
          </a>
        </>
      ) : (
        <figcaption>{failed ? t.error : t.imageLoading}</figcaption>
      )}
    </figure>
  );
}

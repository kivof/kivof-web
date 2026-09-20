import { useId } from "react";
import styles from "./RobotSceneStyles.module.css";
export function RobotScene({
  title,
  caption,
}: {
  title: string;
  caption: string;
}) {
  const id = useId().replaceAll(":", "");
  return (
    <figure className={styles.scene}>
      <svg viewBox="0 0 800 420" role="img" aria-labelledby={id}>
        <title id={id}>{title}</title>
        <defs>
          <pattern
            id={`${id}grid`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0H0v40"
              fill="none"
              stroke="currentColor"
              strokeWidth=".5"
              opacity=".16"
            />
          </pattern>
        </defs>
        <rect width="800" height="420" fill={`url(#${id}grid)`} />
        <g className={styles.platform}>
          <path d="M95 280l285-160 322 144-275 145z" />
          <path d="M95 280v17l331 120 276-138v-15 M426 400v17" />
        </g>
        <g className={styles.track}>
          <path d="M160 285l269 94 191-95-265-111z" />
          <path d="M184 280l243 86 169-82-240-99z" />
        </g>
        <g className={styles.arm}>
          <path d="M220 290l48 16 49-24-48-16z" />
          <path d="M246 281v-61l21-13 25 8v62l-23 15z" />
          <path d="M257 219l-48-92 25-17 36 12 42 89-23 15z" />
          <path d="M225 116l119-60 27 17-107 70z" />
          <path d="M344 57l34 7 10 78-22 9-19-14z" />
          <path d="M367 143v29l14 6 16-10 M381 177v20 M371 178l-9 20" />
          <circle cx="260" cy="218" r="17" />
          <circle cx="228" cy="126" r="16" />
          <circle cx="359" cy="75" r="14" />
        </g>
        <g className={styles.cable}>
          <path d="M389 209c26-34 57-27 58 7s32 49 51 27 38-12 46 17" />
          <path d="M400 223l20 7m47-2 22 7m33 24 23 7" />
        </g>
        <g className={styles.guides}>
          <path d="M407 221v-25h23v32 M474 240v-24h22v31 M531 267v-26h23v30" />
          <rect x="567" y="258" width="38" height="24" rx="3" />
        </g>
        <g className={styles.labels}>
          <text x="193" y="87">
            R-01
          </text>
          <path d="M212 92v17" />
          <text x="411" y="181">
            G1
          </text>
          <text x="475" y="201">
            G2
          </text>
          <text x="531" y="227">
            G3
          </text>
          <text x="565" y="306">
            I/O
          </text>
          <text x="114" y="343">
            HARNESS FORGE
          </text>
          <text x="609" y="188">
            CELL 01
          </text>
          <path d="M619 197v46h-22" />
        </g>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

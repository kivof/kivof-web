import styles from "./CheeseLineStyles.module.css";

export function CheeseLine({ copy }: { copy: Record<string, string> }) {
  return (
    <figure className={styles.scene}>
      <div className={styles.labels}>
        <span>01 / {copy.factoryCamera}</span>
        <span>02 / {copy.factoryRobot}</span>
        <span>03 / {copy.factoryBins}</span>
      </div>
      <svg viewBox="0 0 700 340" role="img" aria-label={copy.factorySceneTitle}>
        <title>{copy.factorySceneTitle}</title>
        <path
          className={styles.grid}
          d="M0 275h700M0 305h700M70 0v340M170 0v340M270 0v340M370 0v340M470 0v340M570 0v340M670 0v340"
        />
        <path className={styles.belt} d="M35 190h320l55 50H90z" />
        <path
          className={styles.rail}
          d="M35 190v20l55 50h320v-20M90 240v20M125 240v20M180 240v20M235 240v20M290 240v20M345 240v20"
        />
        <path
          className={styles.cheese}
          d="m115 186 40-26 31 39-64 8zM250 196l24-40 42 33-13 25z"
        />
        <circle className={styles.hole} cx="141" cy="190" r="5" />
        <circle className={styles.hole} cx="164" cy="191" r="3" />
        <circle className={styles.hole} cx="280" cy="187" r="6" />
        <path className={styles.scan} d="m178 93-59 121h139L198 93z" />
        <rect
          className={styles.camera}
          x="155"
          y="62"
          width="68"
          height="38"
          rx="8"
        />
        <circle className={styles.lens} cx="188" cy="83" r="10" />
        <path className={styles.robotBase} d="m333 272 38-25 60 11-37 27z" />
        <path className={styles.arm} d="m379 259-10-88 61-70 69 36" />
        <circle className={styles.joint} cx="370" cy="172" r="16" />
        <circle className={styles.joint} cx="430" cy="104" r="15" />
        <path
          className={styles.gripper}
          d="m498 138 15 13m-20-8 1 25 19 8m-7-39 25 7 2 24"
        />
        <path className={styles.route} d="M314 182q113-79 205 21" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${475 + i * 64} ${235 - i * 24})`}>
            <path
              className={styles.bin}
              d="m0 0 47-17 23 21-47 18zM0 0v50l23 24V22M23 74l47-20V4"
            />
            <circle className={styles.binMark} cx="47" cy="32" r="7" />
          </g>
        ))}
      </svg>
      <figcaption>
        <span>{copy.factoryConcept}</span>
        <strong>{copy.factoryReject}</strong>
      </figcaption>
    </figure>
  );
}

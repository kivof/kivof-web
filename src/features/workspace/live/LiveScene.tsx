"use client";
import { useEffect, useId, useState } from "react";
import { RecordedScene } from "@/components/ui/data-display/RecordedScene/RecordedScene";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Run } from "@/lib/models/domain";
import {
  DEFAULT_CAMERA,
  moveCamera,
  robotAtPoint,
} from "@/lib/models/liveScene";
import styles from "./LiveSceneStyles.module.css";
import { liveLabels } from "./liveLabels";
import { RobotInspector } from "./RobotInspector";
import { useCameraControls } from "./useCameraControls";
import { useLiveScene } from "./useLiveScene";

export function LiveScene({ run, title }: { run?: Run | null; title: string }) {
  const { locale } = usePreferences();
  const labels = liveLabels(locale);
  const live = useLiveScene();
  const scene = live.scene;
  const active = scene?.status === "live" || scene?.status === "starting";
  const enabled = scene?.status === "live" && live.age < 10;
  const controls = useCameraControls(
    enabled,
    scene?.camera ?? DEFAULT_CAMERA,
    live.camera,
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const hintId = useId();
  const robot = scene?.robots.find((item) => item.id === selected);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  useEffect(() => {
    const exitExpanded = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", exitExpanded);
    return () => document.removeEventListener("keydown", exitExpanded);
  }, []);
  const status =
    live.starting || scene?.status === "starting"
      ? labels.starting
      : scene?.status === "stopped"
        ? labels.stopped
        : active && live.age < 10
          ? labels.live
          : scene?.frame
            ? labels.stale
            : labels.recorded;
  function select(id: string) {
    if (performance.now() > controls.ignoreClickUntil.current) setSelected(id);
  }
  const orbit = (dx: number, dy: number) =>
    controls.update(moveCamera(controls.camera.current, dx, dy));
  const zoom = (factor: number) =>
    controls.update({
      ...controls.camera.current,
      distance: controls.camera.current.distance * factor,
    });
  return (
    <section
      className={styles.viewer}
      data-expanded={expanded}
      data-live-status={scene?.status ?? "idle"}
      aria-label={labels.overview}
    >
      <header className={styles.toolbar}>
        <output>{status}</output>
        <div>
          <button
            type="button"
            className={styles.primary}
            disabled={live.starting}
            onClick={() => {
              if (active) void live.stop();
              else void live.start();
            }}
          >
            {active
              ? labels.stop
              : live.starting
                ? labels.starting
                : labels.start}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-pressed={expanded}
          >
            {expanded ? labels.exitFullscreen : labels.fullscreen}
          </button>
        </div>
      </header>
      {live.error && (
        <p role="alert" className={styles.notice}>
          {labels[live.error]}
        </p>
      )}
      {(live.starting || scene?.status === "starting") && (
        <p className={styles.notice}>{labels.warming}</p>
      )}
      <div className={styles.layout}>
        <div className={styles.canvasColumn}>
          {/* biome-ignore lint/a11y/useSemanticElements: Focusable camera interaction surface is not a form fieldset. */}
          <div
            className={styles.surface}
            ref={controls.surface}
            tabIndex={enabled ? 0 : -1}
            role="group"
            aria-label={title}
            aria-describedby={hintId}
            data-enabled={enabled}
            onClick={(event) => {
              if (
                !scene?.frame ||
                (event.target as Element).closest('[role="button"]')
              )
                return;
              const bounds = event.currentTarget.getBoundingClientRect();
              const id = robotAtPoint(
                scene.robots,
                (event.clientX - bounds.left) / bounds.width,
                (event.clientY - bounds.top) / bounds.height,
              );
              if (id) select(id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && scene?.robots[0])
                select(scene.robots[0].id);
            }}
          >
            {scene?.frame ? (
              <>
                {/* biome-ignore lint/performance/noImgElement: Bounded authenticated native renderer frame. */}
                <img
                  src={scene.frame.data_url}
                  width={scene.frame.width}
                  height={scene.frame.height}
                  alt={`${labels.live} · ${labels.frame} ${scene.sequence}`}
                  draggable={false}
                />
                <svg
                  className={styles.markers}
                  viewBox={`0 0 ${scene.frame.width} ${scene.frame.height}`}
                  aria-label={labels.select}
                >
                  <title>{labels.select}</title>
                  {scene.robots
                    .filter((item) =>
                      item.screen?.every((v) => v >= 0 && v <= 1),
                    )
                    .map((item) => {
                      const point = item.screen as [number, number];
                      return (
                        // biome-ignore lint/a11y/useSemanticElements: SVG screen-space marker supports pointer and keyboard activation.
                        <g
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`${labels.inspect} ${item.id}`}
                          aria-pressed={selected === item.id}
                          data-selected={selected === item.id}
                          className={styles.marker}
                          transform={`translate(${point[0] * (scene.frame?.width ?? 960)} ${point[1] * (scene.frame?.height ?? 864)})`}
                          onClick={() => select(item.id)}
                          onKeyDown={(event) => {
                            if (["Enter", " "].includes(event.key)) {
                              event.preventDefault();
                              event.stopPropagation();
                              select(item.id);
                            }
                          }}
                        >
                          <circle r="26" />
                          <text textAnchor="middle" dominantBaseline="central">
                            {Number(item.id.slice(7)) + 1}
                          </text>
                        </g>
                      );
                    })}
                </svg>
              </>
            ) : (
              <RecordedScene run={run} title={title} />
            )}
          </div>
          <section className={styles.controls} aria-label={labels.reset}>
            {(
              [
                ["←", labels.orbitLeft, () => orbit(-15, 0)],
                ["→", labels.orbitRight, () => orbit(15, 0)],
                ["↑", labels.orbitUp, () => orbit(0, 8)],
                ["↓", labels.orbitDown, () => orbit(0, -8)],
                ["+", labels.zoomIn, () => zoom(0.8)],
                ["−", labels.zoomOut, () => zoom(1.25)],
                [
                  labels.reset,
                  labels.reset,
                  () => controls.update(DEFAULT_CAMERA),
                ],
              ] as const
            ).map(([text, label, action]) => (
              <button
                type="button"
                key={label}
                aria-label={label}
                title={label}
                disabled={!enabled}
                onClick={action}
              >
                {text}
              </button>
            ))}
          </section>
          <p className={styles.help} id={hintId}>
            {labels.hint}
            <br />
            {labels.keys}
          </p>
        </div>
        {robot && (
          <RobotInspector
            robot={robot}
            labels={labels}
            locale={locale}
            enabled={enabled}
            onFocus={() =>
              controls.update({
                ...controls.camera.current,
                distance: 3.5,
                target: [
                  robot.position[0],
                  robot.position[1],
                  robot.position[2] + 0.5,
                ],
              })
            }
          />
        )}
      </div>
      {!!scene?.robots.length && (
        <section className={styles.robots} aria-label={labels.select}>
          {scene.robots.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={selected === item.id}
              onClick={() => select(item.id)}
            >
              {item.id}
            </button>
          ))}
        </section>
      )}
      <footer className={styles.footer}>
        <span>{labels.provenance}</span>
        {scene?.frame && (
          <span data-frame-sequence={scene.sequence}>
            {labels.frame} {number.format(scene.sequence)} ·{" "}
            {number.format(live.fps)} {labels.fps} · {labels.age}{" "}
            {number.format(live.age)} s
          </span>
        )}
      </footer>
    </section>
  );
}

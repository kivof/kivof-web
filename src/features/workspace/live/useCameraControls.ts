"use client";
import { useEffect, useRef } from "react";
import {
  type Camera,
  clampCamera,
  DEFAULT_CAMERA,
  moveCamera,
} from "@/lib/models/liveScene";

export function useCameraControls(
  enabled: boolean,
  initial: Camera,
  send: (value: Camera) => Promise<void>,
) {
  const surface = useRef<HTMLDivElement>(null);
  const camera = useRef(initial);
  const dragging = useRef(false);
  const ignoreClickUntil = useRef(0);
  useEffect(() => {
    if (!enabled) camera.current = initial;
  }, [enabled, initial]);
  const update = (value: Camera) => {
    if (!enabled) return;
    camera.current = clampCamera(value);
    void send(camera.current);
  };
  useEffect(() => {
    const element = surface.current;
    if (!element || !enabled) return;
    let last: {
      x: number;
      y: number;
      id: number;
      moved: number;
      shift: boolean;
    } | null = null;
    let pending: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (pending) return;
      pending = setTimeout(() => {
        pending = undefined;
        void send(camera.current);
      }, 160);
    };
    const down = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        (event.target as Element).closest('[role="button"]')
      )
        return;
      last = {
        x: event.clientX,
        y: event.clientY,
        id: event.pointerId,
        moved: 0,
        shift: event.shiftKey,
      };
      element.setPointerCapture(event.pointerId);
      element.focus();
    };
    const move = (event: PointerEvent) => {
      if (!last || last.id !== event.pointerId) return;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      last.moved += Math.abs(dx) + Math.abs(dy);
      dragging.current = last.moved > 3;
      camera.current = moveCamera(
        camera.current,
        -dx * 0.25,
        dy * 0.2,
        event.shiftKey || last.shift,
      );
      last.x = event.clientX;
      last.y = event.clientY;
      schedule();
    };
    const up = () => {
      if (dragging.current) ignoreClickUntil.current = performance.now() + 250;
      last = null;
      dragging.current = false;
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.current = clampCamera({
        ...camera.current,
        distance: camera.current.distance * Math.exp(event.deltaY * 0.001),
      });
      schedule();
    };
    const key = (event: KeyboardEvent) => {
      if ((event.target as Element).closest('[role="button"]')) return;
      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-8, 0],
        ArrowRight: [8, 0],
        ArrowUp: [0, 5],
        ArrowDown: [0, -5],
      };
      if (delta[event.key])
        camera.current = moveCamera(
          camera.current,
          ...delta[event.key],
          event.shiftKey,
        );
      else if (["+", "=", "-", "_"].includes(event.key))
        camera.current = clampCamera({
          ...camera.current,
          distance:
            camera.current.distance *
            (["+", "="].includes(event.key) ? 0.85 : 1.15),
        });
      else if (event.key.toLowerCase() === "r") camera.current = DEFAULT_CAMERA;
      else return;
      event.preventDefault();
      schedule();
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("keydown", key);
    return () => {
      if (pending) clearTimeout(pending);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("keydown", key);
    };
  }, [enabled, send]);
  return { surface, camera, update, ignoreClickUntil };
}

import { api } from "./client";

export function startDemoSession() {
  return api("auth/demo", {});
}

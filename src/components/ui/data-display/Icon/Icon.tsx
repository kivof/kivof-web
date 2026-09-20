export type IconName =
  | "grid"
  | "robot"
  | "activity"
  | "graph"
  | "tag"
  | "cube"
  | "chat"
  | "arrow"
  | "sun"
  | "moon"
  | "plus"
  | "send"
  | "mic"
  | "stop"
  | "check"
  | "chevron"
  | "logout"
  | "image"
  | "shield"
  | "bolt"
  | "menu"
  | "close"
  | "expand";
const paths: Record<IconName, string> = {
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  robot:
    "M8 18v3h8v-3 M6 8h12v10H6z M9 12h.01 M15 12h.01 M12 8V4 M10 4h4 M3 11v4 M21 11v4",
  activity: "M2 12h5l3-8 4 16 3-8h5",
  graph: "M5 5h4v4H5z M15 15h4v4h-4z M15 3h4v4h-4z M9 7l6-2 M9 9l6 6",
  tag: "M3 3h8l10 10-8 8L3 11z M7 7h.01",
  cube: "M12 2l10 5v10l-10 5-10-5V7z M2 7l10 5 10-5 M12 12v10",
  chat: "M21 11a8 8 0 01-8 8H6l-4 3V5a3 3 0 013-3h8a8 8 0 018 9z M6 8h10 M6 12h7",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  sun: "M12 3V1 M12 23v-2 M3 12H1 M23 12h-2 M5 5L3 3 M21 21l-2-2 M19 5l2-2 M3 21l2-2 M16 12a4 4 0 11-8 0 4 4 0 018 0",
  moon: "M21 13A9 9 0 0111 3a9 9 0 1010 10",
  plus: "M12 5v14 M5 12h14",
  send: "M12 20V4 M5 11l7-7 7 7",
  mic: "M9 4a3 3 0 016 0v8a3 3 0 01-6 0z M5 10v2a7 7 0 0014 0v-2 M12 19v4 M8 23h8",
  stop: "M6 6h12v12H6z",
  check: "M4 12l5 5L20 6",
  chevron: "M8 4l8 8-8 8",
  logout: "M9 3H3v18h6 M14 7l5 5-5 5 M7 12h12",
  image: "M3 3h18v18H3z M3 16l5-5 5 5 4-4 4 4 M15 7h.01",
  shield: "M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6z M8 12l3 3 5-6",
  bolt: "M13 2L4 14h7l-1 8 10-12h-7z",
  menu: "M3 6h18 M3 12h18 M3 18h18",
  close: "M5 5l14 14 M19 5L5 19",
  expand: "M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5",
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** Small stroke icons used by the tab bar and status marks. */
const paths = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  board: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v6h-4z",
  snowflake: "M12 2v20M4.9 6.9l14.2 10.2M19.1 6.9 4.9 17.1",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 7v6M12 17h.01",
  chevronDown: "M6 9l6 6 6-6",
  sun: "M12 4v2M12 18v2M4 12h2M18 12h2M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  rupee: "M7 5h10M7 9h10M7 5c6 0 6 8 0 8l7 6",
  plus: "M12 5v14M5 12h14",
  x: "M6 6l12 12M18 6 6 18",
  image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 8.5h.01",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  gear: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1",
};

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 13,
  strokeWidth = 2.4,
  className = "stroke-current",
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}

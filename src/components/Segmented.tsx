/** Pill segmented control. Selected segment = teal fill, white text (DESIGN.md §2b). */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; ariaLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid gap-0.5 rounded-full bg-fill-strong p-[3px]"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            aria-label={o.ariaLabel}
            onClick={() => onChange(o.value)}
            className={`press min-h-11 cursor-pointer rounded-full border-0 px-1 text-[13px] transition-colors motion-reduce:transition-none ${
              on ? "bg-accent-soft font-semibold text-ink" : "bg-transparent font-medium text-ink hover:bg-fill"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

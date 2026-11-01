import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

/** A link that looks like the plain pill button (for actions that open another page). */
export function PillLink({ className = "", ...props }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      className={`press inline-flex min-h-11 items-center rounded-full border border-solid border-line bg-card px-4 text-[13px] font-semibold text-ink no-underline hover:bg-fill-strong hover:text-ink sm:min-h-9 ${className}`}
      {...props}
    />
  );
}

"use client";

import { istParts, useNow } from "@/components/useNow";

/** "Good morning" etc. by the hour in India. */
function greeting(minutes: number) {
  const h = minutes / 60;
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
}

/** The Overview header: only the greeting, by the time in India. */
export function OverviewHeader() {
  const now = useNow();
  return (
    <h1 className="display m-0 text-[36px] leading-[1.05] text-balance sm:text-[48px]">
      {now == null ? "Hello" : greeting(istParts(now).minutes)}, Yasir
    </h1>
  );
}

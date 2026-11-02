"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * When a page crashes (a bug, or the database didn't answer): a short message and Try again,
 * never a blank screen. The details go to the browser console and Vercel's logs, not the page.
 */
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-tile bg-card p-6 shadow-tile">
        <h1 className="display m-0 text-[28px] leading-tight">Something went wrong</h1>
        <p className="m-0 text-[15px] text-soft">This page couldn&apos;t load. Your data is safe. Try again, or go back to the Overview.</p>
        {error.digest && <p className="m-0 font-mono text-xs text-soft">Error code: {error.digest}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="press min-h-11 flex-1 cursor-pointer rounded-full border-0 bg-pop px-4 text-base font-semibold text-ink hover:bg-pop-strong">
            Try again
          </button>
          <Link href="/" className="press flex min-h-11 flex-1 items-center justify-center rounded-full bg-fill-strong px-4 text-base font-semibold text-ink no-underline">
            Overview
          </Link>
        </div>
      </div>
    </main>
  );
}

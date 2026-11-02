import Link from "next/link";

/** A link that goes nowhere (or a share link with the wrong token): a short note and a way back. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-tile bg-card p-6 shadow-tile">
        <h1 className="display m-0 text-[28px] leading-tight">Page not found</h1>
        <p className="m-0 text-[15px] text-soft">This link doesn&apos;t lead anywhere in Decko.</p>
        <Link href="/" className="press flex min-h-11 items-center justify-center rounded-full bg-pop px-4 text-base font-semibold text-ink no-underline hover:bg-pop-strong">
          Go to the Overview
        </Link>
      </div>
    </main>
  );
}

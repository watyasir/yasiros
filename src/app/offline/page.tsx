import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline", robots: { index: false } };

/** Shown by the service worker (public/sw.js) when there's no network and no saved copy of the page. */
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3 rounded-[20px] border border-line bg-card p-6">
        <h1 className="m-0 text-[28px] leading-tight display tracking-[-0.02em]">You&apos;re offline</h1>
        <p className="m-0 text-[15px] text-soft">Decko needs the internet to load this page. Check your connection, then try again.</p>
        {/* A full page load, not an in-app jump: the in-app one needs the network to start. */}
        <form action="/" className="flex">
          <button
            type="submit"
            className="min-h-11 flex-1 cursor-pointer rounded-full border-0 bg-pop px-4 text-[17px] font-semibold text-ink hover:bg-pop-strong"
          >
            Try again
          </button>
        </form>
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { OwnerDashboard } from "./OwnerDashboard";

/** Signed in as the owner: the Overview. Anyone else: a short welcome with the demo link. */
export default function Home() {
  return <OwnerDashboard view="overview" signedOut={<Welcome />} />;
}

function Welcome() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-tile border border-line bg-card p-8 text-center shadow-tile">
        {/* The Bento app icon (public/icons/icon.svg). */}
        <Image src="/icons/icon.svg" alt="" width={56} height={56} unoptimized className="rounded-item" />
        <h1 className="m-0 text-[32px] display tracking-[-0.02em]">Decko</h1>
        <p className="m-0 text-soft">A personal life dashboard with a 90-day Winter Arc season.</p>
        <Link href="/demo" className="press mt-3 inline-flex min-h-11 items-center rounded-full bg-pop px-5 text-sm font-semibold text-ink no-underline hover:bg-pop-strong">
          View the demo
        </Link>
        <p className="m-0 text-sm text-soft">
          It&apos;s you?{" "}
          <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-accent hover:text-accent-strong">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

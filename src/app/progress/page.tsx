import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProgressCard } from "@/components/share/ProgressCard";
import { currentOwner } from "@/lib/auth";
import { loadDashboardData } from "@/lib/dashboard/load";
import { toShareCard } from "@/lib/share";
import { isShareToken, loadPublicShareCard, shareToken } from "@/lib/share-store";

export const metadata: Metadata = {
  title: "Winter Arc progress",
  description: "Winter Arc progress: day, streaks, targets, workouts and weight change.",
  // The token is in the link: keep it out of search results and out of other sites' logs.
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

/** The share card. Signed in: your card plus "Copy link". With ?t=<SHARE_TOKEN>: the card only. Anyone else: not found. */
export default function ProgressPage({ searchParams }: PageProps<"/progress">) {
  return (
    <Suspense
      fallback={
        <p role="status" className="m-0 p-6 text-center text-[15px] text-soft">
          Loading progress…
        </p>
      }
    >
      <ProgressContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProgressContent({ searchParams }: Pick<PageProps<"/progress">, "searchParams">) {
  const { t } = await searchParams;
  const token = shareToken();
  const sharePath = token ? `/progress?t=${encodeURIComponent(token)}` : null;

  const owner = await currentOwner();
  if (owner) {
    const data = await loadDashboardData(owner.supabase);
    if (!data) return <LoadError />;
    // Owner only: the 9 calendar feeds are listed in /settings.
    return <ProgressCard card={toShareCard(data)} sharePath={sharePath} calendarHref="/settings#calendar" backHref="/" />;
  }

  if (!isShareToken(typeof t === "string" ? t : undefined)) notFound();
  const card = await loadPublicShareCard();
  if (card === undefined) return <LoadError />;
  return <ProgressCard card={card} sharePath={sharePath} />;
}

function LoadError() {
  return <p className="m-0 p-6 text-center text-[15px] text-danger">Couldn&apos;t load the progress card. Refresh to try again.</p>;
}

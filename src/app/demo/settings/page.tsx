import type { Metadata } from "next";
import Link from "next/link";
import { Group } from "@/components/FormGroup";
import { ClaudeJobsSection, MoreSection } from "@/components/settings/ExtrasSections";
import { demoClaudeJobs } from "@/data/demo/claude-jobs";

export const metadata: Metadata = { title: "Demo · Settings · Yasir OS", description: "Yasir OS settings on made-up sample data." };

/** /demo's Settings: the Gallery and share card links and Claude's jobs, as in the real app. Nothing to save here. */
export default function DemoSettingsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-6 pb-8">
      <header className="no-select flex items-center justify-between">
        <h1 className="display m-0 text-[34px] leading-[1.1] tracking-[-0.02em]">Settings</h1>
        <Link href="/demo" prefetch className="press flex min-h-11 items-center text-[17px] text-accent no-underline hover:text-accent-strong">
          Done
        </Link>
      </header>
      <Group title="Appearance">
        <p className="m-0 py-3 text-[15px] text-soft">The demo always uses Candy. In the real app you pick Candy, Matcha or Sunset here.</p>
      </Group>
      <MoreSection galleryHref="/demo/gallery" shareHref="/demo/progress" />
      <ClaudeJobsSection jobs={demoClaudeJobs} />
      <p className="m-0 mx-4 text-[13px] text-soft">Demo: the season, trackers, calendar feeds and sign-in code are in the real app&apos;s Settings.</p>
    </main>
  );
}

"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { ProgressBar } from "@/components/ProgressBar";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { formatRupees } from "@/lib/format";
import { toneBg, type Tone } from "@/lib/tones";
import type { DashboardData } from "@/modules/types";
import { WalletStack } from "./WalletStack";

type Money = NonNullable<DashboardData["money"]>;

const SPLIT: { key: keyof Money["split"]; label: string; tone: Tone }[] = [
  { key: "needs", label: "Needs", tone: "accent" },
  { key: "wants", label: "Wants", tone: "warn" },
  { key: "savings", label: "Savings", tone: "ok" },
];

/** The Money page: the wallet stack (tap an account), spend vs income, the 50/20/30 split, top spends. */
export function MoneyView() {
  const { money } = useDashboard().data;
  if (!money) {
    return (
      <Tile title="Money">
        <EmptyNote>Your accounts, cards and monthly split show here once the finance task sends its first snapshot.</EmptyNote>
      </Tile>
    );
  }
  return (
    <div className="grid items-start gap-4 min-[861px]:grid-cols-2">
      <Tile title={`Wallet · ${money.month}`} tone="money" aside={<span className="text-xs text-soft">Updated {money.updated}</span>}>
        <WalletStack accounts={money.accounts} spendable={money.spendable} savedThisMonth={money.income - money.spent} />
      </Tile>
      <Tile title="This month">
        <SpendVsIncome money={money} />
        <SplitBars split={money.split} />
        {money.categories.length > 0 && <TopCategories categories={money.categories} />}
      </Tile>
    </div>
  );
}

function SpendVsIncome({ money }: { money: Money }) {
  const pct = money.income > 0 ? Math.round((money.spent / money.income) * 100) : 0;
  const over = money.spent > money.income;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-2 text-sm">
        <span className="font-semibold">Spent vs income</span>
        <span className={`text-xs ${over ? "font-semibold text-danger" : "text-soft"}`}>
          {formatRupees(money.spent)} of {formatRupees(money.income)}
          {over && " · over"}
        </span>
      </div>
      <ProgressBar pct={Math.min(100, pct)} tone={over ? "danger" : "accent"} label={`Spent ${pct}% of income`} />
    </div>
  );
}

/** Needs / wants / savings as % of income, each with a marker at its target. */
function SplitBars({ split }: { split: Money["split"] }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-2.5">
      <span className="text-sm font-semibold">Split vs target</span>
      {SPLIT.map(({ key, label, tone }) => {
        const { actual, target } = split[key];
        const width = Math.max(0, Math.min(100, actual));
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-soft">{label}</span>
              <span>
                <strong className="text-ink">{Math.round(actual)}%</strong>
                <span className="text-soft"> / {target}%</span>
              </span>
            </div>
            <div
              role="img"
              aria-label={`${label}: ${Math.round(actual)}% of income, target ${target}%`}
              className="relative h-1.5 rounded-full bg-fill"
            >
              <div className={`h-full rounded-full ${toneBg[tone]}`} style={{ width: `${width}%` }} />
              <div aria-hidden="true" className="absolute -top-0.5 h-2.5 w-0.5 rounded-full bg-ink" style={{ left: `calc(${target}% - 1px)` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TopCategories({ categories }: { categories: Money["categories"] }) {
  return (
    <div className="flex flex-col border-t border-line pt-2.5">
      <span className="text-sm font-semibold">Top spends</span>
      <ul className="m-0 list-none p-0">
        {categories.map((c) => (
          <li key={c.name} className="flex justify-between gap-2 border-b border-line py-1.5 text-sm last:border-b-0">
            <span>{c.name}</span>
            <span className="font-semibold">{formatRupees(c.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

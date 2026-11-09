"use client";

import { useState } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { useCountUp } from "@/components/useCountUp";
import { formatRupees } from "@/lib/format";

// Back to front: the front card is solid white, the ones behind fade into the tile.
const CARD = ["bg-card", "bg-card/75", "bg-card/50"];

/**
 * Money at a glance: what's left to spend this month (big, counts up once), the wallet of up to
 * 3 bank cards back to front (hover, focus or tap fans them), and when it was updated. Until a bank
 * has a balance, just one line (v10.2).
 */
export function MoneyTile() {
  const { data } = useDashboard();
  const money = data.money;
  const href = viewHref(data.basePath, "finance");
  const [fanned, setFanned] = useState(false);
  const banks = money ? money.accounts.filter((a) => a.kind !== "card").slice(0, 3) : [];
  const cards = banks.map((b) => ({ name: b.name, amount: b.balance }));
  const counted = useCountUp(money?.spendable ?? 0);

  // No bank with a real balance yet: until the finance sheet has opening balances it sends one
  // combined bank that's 0 or below zero. One line then, never a made-up or negative total.
  if (!money || !banks.some((b) => b.balance > 0)) {
    return (
      <Tile title="Money" href={href} tone="money" area="money">
        <EmptyNote>Add balances to see money.</EmptyNote>
      </Tile>
    );
  }
  return (
    <Tile title="Money" href={href} tone="money" area="money" tilt>
      <div className="flex flex-col gap-0.5">
        <span className="display text-[36px] leading-none">{formatRupees(Math.round(counted))}</span>
        <span className="text-xs font-semibold text-soft">left to spend</span>
      </div>
      <button
        type="button"
        aria-expanded={fanned}
        aria-label={fanned ? "Stack the accounts" : "Fan out the accounts"}
        onClick={() => setFanned((f) => !f)}
        onMouseEnter={() => setFanned(true)}
        onMouseLeave={() => setFanned(false)}
        onFocus={() => setFanned(true)}
        onBlur={() => setFanned(false)}
        className="relative min-h-[130px] w-full flex-1 cursor-pointer rounded-item border-0 bg-transparent p-0 text-left text-ink"
      >
        {cards.map((c, i) => {
          // The last card is the front one. Stacked: 22px apart (each name shows). Fanned: 48px apart, slightly turned.
          const back = cards.length - 1 - i;
          const y = fanned ? -back * 48 : -back * 22;
          return (
            <span
              key={c.name}
              style={{ transform: `translateY(${y}px) rotate(${fanned ? (back - 1) * -2 : 0}deg) scale(${1 - back * (fanned ? 0.02 : 0.04)})`, zIndex: 3 - back }}
              className={`absolute inset-x-0 bottom-0 flex h-[72px] flex-col justify-between rounded-item px-3.5 py-2.5 shadow-tile transition-transform duration-300 ease-out ${CARD[back]}`}
            >
              <span className="label text-soft">{c.name}</span>
              <span className="display text-xl">{formatRupees(c.amount)}</span>
            </span>
          );
        })}
      </button>
      <span className="text-xs text-soft">Updated {money.updated}</span>
    </Tile>
  );
}

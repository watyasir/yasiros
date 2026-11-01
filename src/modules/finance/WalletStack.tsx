"use client";

import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/Chip";
import { formatRupees, formatSignedRupees } from "@/lib/format";
import type { Account } from "@/modules/types";

// Tab colour by account type (DESIGN.md §2b, wallet stack).
const tabStyle: Record<Account["kind"], string> = {
  savings: "bg-pop text-ink",
  current: "bg-accent-soft text-ink",
  card: "bg-warn-soft text-ink",
  other: "bg-fill-strong text-ink",
};

function tabLabel(a: Account) {
  if (a.kind === "card") return `${a.name}, ${formatRupees(-a.balance)} owed${a.due ? `, due ${a.due}` : ""}`;
  return `${a.name}, ${formatRupees(a.balance)}`;
}

/**
 * Accounts as a stack of coloured tabs above a white front card with what's left to spend.
 * Clicking a tab shows that account in the same tile; Escape or "All accounts" goes back.
 */
export function WalletStack({
  accounts,
  spendable,
  savedThisMonth,
}: {
  accounts: Account[];
  spendable: number;
  savedThisMonth: number;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const lastOpened = useRef<string | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const detailRef = useRef<HTMLHeadingElement>(null);
  const open = accounts.find((a) => a.id === openId);

  // Move focus into the detail when it opens, and back to its tab when it closes.
  useEffect(() => {
    if (openId) {
      detailRef.current?.focus();
    } else if (lastOpened.current) {
      tabRefs.current[lastOpened.current]?.focus();
    }
  }, [openId]);

  const show = (id: string) => {
    lastOpened.current = id;
    setOpenId(id);
  };

  if (open) {
    return (
      <div
        className="flex flex-col gap-2.5 rounded-2xl border border-line bg-card px-4 pt-3.5 pb-4"
        onKeyDown={(e) => e.key === "Escape" && setOpenId(null)}
      >
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="-mx-2 min-h-11 self-start cursor-pointer rounded-full border-0 bg-transparent px-2 text-[13px] font-semibold text-accent hover:text-accent-strong sm:min-h-8"
        >
          ‹ All accounts
        </button>
        <div className="flex items-baseline justify-between gap-2">
          <h3 ref={detailRef} tabIndex={-1} className="m-0 text-[15px] display">
            {open.name}
          </h3>
          {open.due && <Chip tone="neutral">Due {open.due}</Chip>}
        </div>
        <div>
          <div className="text-xs text-soft">{open.kind === "card" ? "Amount owed" : "Balance"}</div>
          <div className="font-mono text-[28px] display">
            {formatRupees(open.kind === "card" ? -open.balance : open.balance)}
          </div>
        </div>
        {open.transactions && open.transactions.length > 0 && (
          <ul className="m-0 list-none p-0" aria-label="Last 5 transactions">
            {open.transactions.slice(0, 5).map((t, i) => (
              <li key={i} className="flex items-center gap-2.5 border-t border-line py-2 text-[13px]">
                <span className="flex-1">{t.label}</span>
                <span className="text-xs text-soft">{t.date}</span>
                <span className={`w-[84px] text-right font-semibold ${t.amount > 0 ? "text-ok" : "text-ink"}`}>
                  {formatSignedRupees(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col" role="group" aria-label="Accounts">
      {accounts.map((a, i) => (
        <button
          key={a.id}
          ref={(el) => {
            tabRefs.current[a.id] = el;
          }}
          type="button"
          aria-label={tabLabel(a)}
          onClick={() => show(a.id)}
          style={{ zIndex: i + 1 }}
          className={`relative -mb-3.5 flex h-[50px] cursor-pointer items-start justify-between gap-2 rounded-t-2xl border-0 px-4 py-2.5 text-left text-[13px] font-semibold ${tabStyle[a.kind]}`}
        >
          <span className="min-w-0 truncate">
            {a.name}
            {a.due && ` · due ${a.due}`}
          </span>
          <span className="shrink-0 font-mono text-sm display whitespace-nowrap">{formatRupees(a.balance)}</span>
        </button>
      ))}
      <div
        style={{ zIndex: accounts.length + 1 }}
        className="relative flex flex-col rounded-2xl border border-line bg-card px-4 pt-3.5 pb-4"
      >
        <span className="self-start rounded-full border border-line bg-card px-2.5 py-[3px] text-[11px] font-semibold">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
        </span>
        <div className="flex flex-wrap items-baseline gap-x-2 pt-3">
          <span className="text-xs text-soft">Available to spend</span>
          {savedThisMonth >= 0 ? (
            <span className="text-xs font-semibold text-ok">+ {formatRupees(savedThisMonth)} saved this month</span>
          ) : (
            <span className="text-xs font-semibold text-danger">{formatRupees(-savedThisMonth)} more spent than earned</span>
          )}
        </div>
        <div className="font-mono text-[32px] display">{formatRupees(spendable)}</div>
      </div>
    </div>
  );
}

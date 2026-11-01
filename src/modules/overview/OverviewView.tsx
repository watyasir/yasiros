"use client";

import { ArcStrip } from "./ArcStrip";
import { MoneyTile } from "./MoneyTile";
import { NextUpTile } from "./NextUpTile";
import { TodayTile } from "./TodayTile";

/** Overview (v10 Focus): Today, Next up, Money and the Winter Arc strip (globals.css `bento`), in priority order. */
export function OverviewView() {
  return (
    <div className="bento">
      <TodayTile />
      <NextUpTile />
      <MoneyTile />
      <ArcStrip />
    </div>
  );
}

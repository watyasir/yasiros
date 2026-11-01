"use client";

import { ArcStrip } from "./ArcStrip";
import { MoneyTile } from "./MoneyTile";
import { NextUpTile } from "./NextUpTile";
import { TodayTile } from "./TodayTile";

/** Overview: four tiles in the bento (globals.css `bento`): Today, Next up, Money, then the Winter Arc strip. Each heading opens its page. */
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

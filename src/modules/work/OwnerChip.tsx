import { Chip, type ChipTone } from "@/components/Chip";
import type { Owner } from "@/modules/types";

/** Owner tags: Claude orange (dark text), Yasir accent (white text), Both neutral. "Me" is stored, "Yasir" is shown. */
const OWNER: Record<Owner, { tone: ChipTone; label: string }> = {
  Me: { tone: "yasir", label: "Yasir" },
  Claude: { tone: "claude", label: "Claude" },
  Both: { tone: "neutral", label: "Both" },
};

export function OwnerChip({ owner }: { owner: Owner }) {
  return <Chip tone={OWNER[owner].tone}>{OWNER[owner].label}</Chip>;
}

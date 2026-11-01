"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Tile } from "@/components/Tile";
import { EmptyNote } from "@/components/EmptyNote";
import { Icon } from "@/components/Icon";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { formatBytes, GALLERY_CATEGORIES, type GalleryCategory, type GalleryItem } from "@/lib/gallery";
import { shortDate } from "@/lib/trackers";

/*
  The gallery (M12): category tabs and a grid of thumbnails. The thumbnails are the originals
  shown small (signed links that expire after an hour); tapping one opens the full-size original
  with pinch zoom, Download original, Share and Delete. The demo runs on made-up images.
*/

type Filter = "All" | GalleryCategory;

export function GalleryView() {
  const { data, galleryActions } = useDashboard();
  const [items, setItems] = useState<GalleryItem[] | null>(data.gallery);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!galleryActions) return;
    let live = true;
    galleryActions.list().then((r) => {
      if (!live) return;
      if (r.ok) setItems(r.items);
      else setFailed(true);
    });
    return () => {
      live = false;
    };
  }, [galleryActions]);

  const counts = new Map<Filter, number>([["All", items?.length ?? 0]]);
  for (const it of items ?? []) counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
  const shown = (items ?? []).filter((it) => filter === "All" || it.category === filter);

  async function remove(item: GalleryItem) {
    if (galleryActions) {
      const r = await galleryActions.remove(item.id);
      if (!r.ok) return false;
    }
    setItems((list) => list?.filter((it) => it.id !== item.id) ?? null);
    setOpen(null);
    return true;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* relative: keeps hidden labels inside the sideways scroll (DESIGN.md §6). */}
      <div className="relative -mx-1 overflow-x-auto px-1 pb-1">
        <div role="group" aria-label="Categories" className="flex w-max gap-2">
          {(["All", ...GALLERY_CATEGORIES] as Filter[]).map((c) => {
            const current = filter === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={current}
                onClick={() => setFilter(c)}
                className={`min-h-11 cursor-pointer rounded-full border border-solid px-4 text-[13px] font-semibold sm:min-h-9 ${
                  current ? "border-pop-strong bg-pop text-ink" : "border-line bg-card text-ink hover:bg-fill"
                }`}
              >
                {c}
                <span className={`ml-1.5 font-medium ${current ? "text-ink" : "text-soft"}`}>{counts.get(c) ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {items === null && !failed && (
        <p role="status" className="m-0 text-[15px] text-soft">
          Loading the gallery…
        </p>
      )}
      {failed && <p className="m-0 text-[15px] text-danger">Couldn&apos;t load the gallery. Refresh to try again.</p>}
      {items && shown.length === 0 && (
        <Tile title={filter === "All" ? "Gallery" : filter}>
          <EmptyNote>
            {items.length === 0
              ? "Nothing here yet. Images and PDFs Claude saves from chats show up here."
              : `Nothing in ${filter} yet.`}
          </EmptyNote>
        </Tile>
      )}

      {shown.length > 0 && (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 p-0">
          {shown.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => setOpen(it)}
                className="flex w-full cursor-pointer flex-col gap-2 rounded-[20px] border border-solid border-line bg-card p-2 text-left text-ink"
              >
                <Thumb item={it} />
                <span className="flex flex-col gap-0.5 px-1.5 pb-1">
                  <span className="truncate text-[13px] font-semibold">{it.title}</span>
                  <span className="text-xs text-soft">
                    {it.category} · {shortDate(it.createdAt.slice(0, 10))}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <Viewer item={open} onClose={() => setOpen(null)} onDelete={remove} />}
    </div>
  );
}

function Thumb({ item }: { item: GalleryItem }) {
  if (item.mime === "application/pdf") {
    return (
      <span className="flex aspect-square w-full items-center justify-center rounded-[14px] bg-fill-strong text-[13px] font-semibold text-soft">
        PDF
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed links to private originals; next/image would re-encode them
    <img src={item.url} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded-[14px] bg-fill-strong object-cover" />
  );
}

/** Full-size original. Fit to the screen by default; "Actual size" shows every pixel (pinch zoom works in both). */
function Viewer({ item, onClose, onDelete }: { item: GalleryItem; onClose: () => void; onDelete: (item: GalleryItem) => Promise<boolean> }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [actual, setActual] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  async function original(): Promise<File> {
    const res = await fetch(item.url);
    if (!res.ok) throw new Error("download failed");
    return new File([await res.blob()], item.fileName, { type: item.mime });
  }

  async function share() {
    setNote(null);
    try {
      const file = await original();
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: item.title });
      else setNote("Sharing files isn't available in this browser. Use Download original.");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setNote("Couldn't share it. Try Download original.");
    }
  }

  async function remove() {
    if (!window.confirm(`Delete "${item.title}"? This removes the original for good.`)) return;
    setBusy(true);
    const ok = await onDelete(item);
    setBusy(false);
    if (!ok) setNote("Couldn't delete it. Try again.");
  }

  const isPdf = item.mime === "application/pdf";
  const size = [item.width && item.height ? `${item.width} × ${item.height}` : null, formatBytes(item.bytes)].filter(Boolean).join(" · ");

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-30 flex flex-col bg-fill">
      <header className="flex items-center gap-3 border-b border-line bg-card px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-fill text-ink"
        >
          <Icon name="x" size={18} strokeWidth={2.4} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold">{item.title}</span>
          <span className="text-xs text-soft">
            {item.category} · {size}
          </span>
        </div>
        {!isPdf && (
          <Button onClick={() => setActual((a) => !a)} aria-pressed={actual}>
            {actual ? "Fit" : "Actual size"}
          </Button>
        )}
      </header>

      <div className={`relative flex-1 overflow-auto [touch-action:pan-x_pan-y_pinch-zoom] ${actual ? "" : "flex items-center justify-center p-3"}`}>
        {isPdf ? (
          // No link out: a PDF opened in the home-screen app has no way back. Download is below.
          <p className="m-auto p-4 text-center text-[15px] text-soft">PDFs don&apos;t preview here. Use Download below.</p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- the untouched original, full size
          <img src={item.url} alt={item.description ?? item.title} className={actual ? "max-w-none" : "max-h-full max-w-full object-contain"} />
        )}
      </div>

      <footer className="flex flex-col gap-2 border-t border-line bg-card px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {item.description && <p className="m-0 text-[13px] text-soft">{item.description}</p>}
        {note && (
          <p role="status" className="m-0 text-[13px] text-danger">
            {note}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <a
            href={item.downloadUrl}
            download={item.fileName}
            className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-pop px-4 text-[13px] font-semibold text-ink no-underline hover:bg-pop-strong hover:text-ink sm:min-h-9"
          >
            Download original
          </a>
          <Button onClick={share} className="flex-1">
            Share
          </Button>
          <Button onClick={remove} disabled={busy} className="flex-1 text-danger">
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

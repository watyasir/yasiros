"use client";

/**
 * Last resort, when even the root layout fails: plain HTML (the app's styles may not have
 * loaded), so it carries its own few styles. Colours match Candy's page and ink.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f1ea", color: "#17152b", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 360, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 26, margin: "0 0 8px" }}>Decko couldn&apos;t load</h1>
          <p style={{ margin: "0 0 16px", color: "#55516a" }}>Your data is safe. Try again in a moment.</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "#ff8a66", color: "#17152b", fontSize: 16, fontWeight: 600 }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

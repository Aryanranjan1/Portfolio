"use client";

export default function RouteError({
  retry,
  area,
}: {
  retry: () => void;
  area: string;
}) {
  return (
    <main style={{ minHeight: "60svh", display: "grid", placeItems: "center", padding: "clamp(24px, 6vw, 80px)", background: "#080808", color: "#efefeb" }}>
      <section style={{ width: "min(100%, 680px)", border: "1px solid #343434", padding: "clamp(24px, 5vw, 56px)" }} aria-labelledby="route-error-title">
        <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: ".12em", color: "#aaa", textTransform: "uppercase" }}>{area} / ERROR</p>
        <h1 id="route-error-title" style={{ fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1.05 }}>This page could not load.</h1>
        <p style={{ maxWidth: 520, lineHeight: 1.6, color: "#bbb" }}>An unexpected problem occurred. Your data has not been exposed. Try loading the page again.</p>
        <button type="button" onClick={retry} style={{ minHeight: 44, padding: "0 18px", border: "1px solid #efefeb", background: "transparent", color: "inherit", cursor: "pointer" }}>Try again</button>
      </section>
    </main>
  );
}

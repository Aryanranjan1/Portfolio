export default function PublicLoading() {
  return (
    <main aria-live="polite" aria-busy="true" style={{ minHeight: "55svh", display: "grid", placeItems: "center", padding: 24 }}>
      <p>Loading page…</p>
    </main>
  );
}

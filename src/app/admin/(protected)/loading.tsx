export default function AdminLoading() {
  return (
    <main aria-live="polite" aria-busy="true" style={{ minHeight: "45svh", display: "grid", placeItems: "center", padding: 24 }}>
      <p>Loading admin page…</p>
    </main>
  );
}

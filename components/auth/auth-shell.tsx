// Server-safe shell shared by every auth page: centers the card and adds a
// subtle footer beneath it. No hooks, no logic - pure layout.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-card">{children}</section>
    </main>
  );
}

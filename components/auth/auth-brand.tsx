// Brand block used at the top of every auth card: [logo] Sociable Beet /
// Work. Collaborate. Inspire. Pure markup - server-safe.
export function AuthBrand() {
  return (
    <div className="auth-brand">
      <img src="/logo.png" alt="Sociable Beet" width={48} height={48} className="auth-brand-logo" />
      <div className="auth-brand-name">Sociable Beet</div>
      <div className="auth-brand-tagline">Work. Collaborate. Inspire.</div>
    </div>
  );
}

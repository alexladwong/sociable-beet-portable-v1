// Deterministic two-letter initials shared by every avatar in the app.
// Examples: "Alex Ladwong" -> AL, "Mr. Dollars Alex" -> MA,
// "info@example.com" -> IN. Never more than two letters, never random.
export function getInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || "").trim();
  if (!source) return "U";

  const words = source
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (words.length === 0) return "U";

  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  // Single token: first two letters ("info@example.com" -> IN).
  const single = source.replace(/[^a-zA-Z0-9]/g, "");
  return (single[0] || "U") + (single[1] || "").toUpperCase();
}

export function UserAvatar({
  name,
  email,
  image,
  size = 32,
  className,
  title,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  /** Diameter in px; the initials font scales with it. */
  size?: number;
  className?: string;
  title?: string;
}) {
  const ariaLabel = title ?? (name || email || "User");

  if (image) {
    return (
      <span
        className={`user-avatar${className ? ` ${className}` : ""}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={ariaLabel}
        title={title}
      >
        <img src={image} alt="" aria-hidden="true" width={size} height={size} referrerPolicy="no-referrer" />
      </span>
    );
  }

  return (
    <span
      className={`user-avatar${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      role="img"
      aria-label={ariaLabel}
      title={title}
    >
      {getInitials(name, email)}
    </span>
  );
}

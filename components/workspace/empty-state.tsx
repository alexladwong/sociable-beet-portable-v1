import Link from "next/link";

export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: { label: string; href?: string; disabled?: boolean };
}) {
  return (
    <div className="empty-state">
      <p className="small">{message}</p>
      {action && (
        action.href && !action.disabled ? (
          <Link href={action.href} className="btn">{action.label}</Link>
        ) : (
          <button type="button" className="btn" disabled title="Coming soon">{action.label}</button>
        )
      )}
    </div>
  );
}

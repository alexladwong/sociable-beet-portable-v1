import { EmptyState } from "./empty-state";

// No activity/audit log model exists yet - always an honest empty state.
export function RecentActivity() {
  return (
    <div className="card">
      <h2 className="section-title">Recent Activity</h2>
      <EmptyState message="Workspace activity will appear here as your team starts working." />
    </div>
  );
}

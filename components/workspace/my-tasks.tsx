import { EmptyState } from "./empty-state";

// Task assignment isn't modeled yet (no assignee field on Task), so this is
// always an honest empty state for now rather than fabricated task rows.
export function MyTasks() {
  return (
    <div className="card">
      <h2 className="section-title">My Tasks</h2>
      <EmptyState message="You're all caught up. Assigned tasks will appear here." />
    </div>
  );
}

import type { Task } from "@prisma/client";
import { CreateTaskForm } from "./create-task-form";
import { TaskRow } from "./task-row";
import { EmptyState } from "@/components/workspace/empty-state";

export function TasksSection({
  workspaceSlug,
  projectId,
  tasks,
  canManage,
}: {
  workspaceSlug: string;
  projectId: string;
  tasks: Task[];
  canManage: boolean;
}) {
  const open = tasks.filter((t) => t.status !== "COMPLETED").length;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Tasks
          <span className="small" style={{ marginLeft: 8, fontWeight: 400 }}>
            {open} open of {tasks.length}
          </span>
        </h2>
      </div>

      {canManage && (
        <div className="card" style={{ marginBottom: 14 }}>
          <CreateTaskForm workspaceSlug={workspaceSlug} projectId={projectId} />
        </div>
      )}

      <div className="card">
        {tasks.length === 0 ? (
          <EmptyState
            message={
              canManage
                ? "No tasks yet. Add your first task to break this project down into work."
                : "No tasks yet."
            }
          />
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              canManage={canManage}
            />
          ))
        )}
      </div>
    </section>
  );
}

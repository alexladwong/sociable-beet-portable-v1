"use client";

import { useActionState } from "react";
import { createTaskAction } from "./actions";
import { TASK_PRIORITIES } from "./schema";

export function CreateTaskForm({
  workspaceSlug,
  projectId,
}: {
  workspaceSlug: string;
  projectId: string;
}) {
  const [state, formAction, isPending] = useActionState(createTaskAction, null);

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="description" value="" />
      <input type="hidden" name="status" value="TODO" />
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <input name="title" placeholder="Task title" required minLength={2} aria-label="Task title" />
          {(state?.fieldErrors?.title || state?.error) && (
            <div className="auth-error" style={{ marginTop: 6 }}>
              {state?.fieldErrors?.title?.[0] || state?.error}
            </div>
          )}
        </div>
        <select
          name="priority"
          aria-label="Priority"
          defaultValue="MEDIUM"
          style={{ width: 140, flexShrink: 0 }}
        >
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input type="date" name="dueDate" aria-label="Due date" style={{ width: 160, flexShrink: 0 }} />
        <button type="submit" className="btn primary" disabled={isPending} style={{ flexShrink: 0 }}>
          {isPending ? "Adding…" : "Add task"}
        </button>
      </div>
    </form>
  );
}

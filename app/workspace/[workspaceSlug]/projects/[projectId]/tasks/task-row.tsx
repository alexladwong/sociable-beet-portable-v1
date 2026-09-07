"use client";

import { useActionState } from "react";
import type { Task } from "@prisma/client";
import { updateTaskAction, toggleTaskCompleteAction, deleteTaskAction } from "./actions";
import { ALL_TASK_STATUSES, TASK_PRIORITIES } from "./schema";
import { ConfirmSubmitButton } from "@/components/workspace/confirm-submit-button";

function dueLabel(date: Date | null) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 0) return `Overdue ${due.toLocaleDateString()}`;
  return `Due ${due.toLocaleDateString()}`;
}

export function TaskRow({
  task,
  workspaceSlug,
  projectId,
  canManage,
}: {
  task: Task;
  workspaceSlug: string;
  projectId: string;
  canManage: boolean;
}) {
  const done = task.status === "COMPLETED";
  const overdue = task.dueDate && task.dueDate.getTime() < Date.now() && !done;

  const [state, formAction, isPending] = useActionState(updateTaskAction, null);

  return (
    <div className={`task-row${done ? " done" : ""}`}>
      <div className="task-main">
        {canManage ? (
          <form action={toggleTaskCompleteAction}>
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="taskId" value={task.id} />
            <button
              type="submit"
              className={`task-check${done ? " checked" : ""}`}
              aria-label={done ? "Mark as not done" : "Mark as done"}
              title={done ? "Mark as not done" : "Mark as done"}
            >
              {done && (
                <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              )}
            </button>
          </form>
        ) : (
          <span className={`task-check static${done ? " checked" : ""}`} aria-hidden="true" />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{task.title}</strong>
          {task.description && (
            <div className="small" style={{ marginTop: 2, whiteSpace: "pre-wrap" }}>{task.description}</div>
          )}
        </div>

        <div className="task-meta">
          <span className="pill">{task.status}</span>
          <span className="pill">{task.priority}</span>
          {task.dueDate && (
            <span className={`small${overdue ? " task-overdue" : ""}`}>{dueLabel(task.dueDate)}</span>
          )}
        </div>

        {canManage && (
        <div className="task-actions">
          <details className="task-edit">
            <summary className="btn">Edit</summary>
            <form action={formAction} className="form" style={{ gap: 8, marginTop: 10 }}>
              <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="taskId" value={task.id} />
              <input name="title" defaultValue={task.title} required minLength={2} aria-label="Task title" />
              <textarea name="description" rows={2} defaultValue={task.description || ""} placeholder="Description (optional)" />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <select name="status" aria-label="Status" defaultValue={task.status} style={{ width: 150 }}>
                  {ALL_TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select name="priority" aria-label="Priority" defaultValue={task.priority} style={{ width: 130 }}>
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="date"
                  name="dueDate"
                  aria-label="Due date"
                  defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""}
                  style={{ width: 160 }}
                />
                <button type="submit" className="btn primary" disabled={isPending}>
                  {isPending ? "Saving…" : "Save"}
                </button>
              </div>
              {(state?.error || state?.fieldErrors?.title) && (
                <div className="auth-error">{state?.fieldErrors?.title?.[0] || state?.error}</div>
              )}
            </form>
          </details>

          <form action={deleteTaskAction}>
            <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="taskId" value={task.id} />
            <ConfirmSubmitButton
              className="btn"
              confirmMessage={`Delete task "${task.title}"? This cannot be undone.`}
            >
              <span style={{ color: "#c0392b" }}>Delete</span>
            </ConfirmSubmitButton>
          </form>
        </div>
        )}
      </div>
    </div>
  );
}

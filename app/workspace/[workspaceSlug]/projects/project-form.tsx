"use client";

import { CREATABLE_PROJECT_STATUSES, PROJECT_PRIORITIES } from "./schema";

export function ProjectForm({
  formAction,
  isPending,
  error,
  fieldErrors,
  defaultValues,
  submitLabel,
  showProgress = false,
  statusOptions,
}: {
  formAction: (formData: FormData) => void;
  isPending: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  defaultValues?: {
    name?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    progress?: number;
  };
  submitLabel: string;
  /** Only shown in edit mode - a new project always starts at 0%. */
  showProgress?: boolean;
  /** Defaults to the create-only subset (no ARCHIVED); edit forms pass the full enum. */
  statusOptions?: readonly string[];
}) {
  const statusChoices = statusOptions ?? CREATABLE_PROJECT_STATUSES;
  return (
    <form action={formAction} className="form">
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Name</div>
        <input name="name" defaultValue={defaultValues?.name} required minLength={2} />
        {fieldErrors?.name && <div className="auth-error">{fieldErrors.name[0]}</div>}
      </div>
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Description</div>
        <textarea name="description" rows={4} defaultValue={defaultValues?.description || ""} />
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Status</div>
          <select name="status" defaultValue={defaultValues?.status || "PLANNING"}>
            {statusChoices.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Priority</div>
          <select name="priority" defaultValue={defaultValues?.priority || "MEDIUM"}>
            {PROJECT_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Start date</div>
          <input type="date" name="startDate" defaultValue={defaultValues?.startDate || ""} />
        </div>
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Due date</div>
          <input type="date" name="dueDate" defaultValue={defaultValues?.dueDate || ""} />
          {fieldErrors?.dueDate && <div className="auth-error">{fieldErrors.dueDate[0]}</div>}
        </div>
      </div>
      {showProgress && (
        <div>
          <div className="label" style={{ marginBottom: 6 }}>Progress (%)</div>
          <input type="number" name="progress" min={0} max={100} defaultValue={defaultValues?.progress ?? 0} />
        </div>
      )}
      {error && <div className="auth-error">{error}</div>}
      <button type="submit" className="btn primary" disabled={isPending}>
        {isPending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

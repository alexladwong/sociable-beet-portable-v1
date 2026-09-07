"use client";

import { useActionState } from "react";
import type { Workspace } from "@prisma/client";
import { updateWorkspaceSettings } from "./actions";

export function SettingsForm({ workspace }: { workspace: Workspace }) {
  const [state, formAction, isPending] = useActionState(updateWorkspaceSettings, null);

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="workspaceId" value={workspace.id} />
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Name</div>
        <input name="name" defaultValue={workspace.name} required minLength={2} />
      </div>
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Slug</div>
        <input name="slug" defaultValue={workspace.slug} required pattern="[a-z0-9-]+" />
      </div>
      <div>
        <div className="label" style={{ marginBottom: 6 }}>Description</div>
        <textarea name="description" rows={4} defaultValue={workspace.description || ""} />
      </div>
      {state?.error && <div className="auth-error">{state.error}</div>}
      <button type="submit" className="btn primary" disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

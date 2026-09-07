"use client";

import { useActionState } from "react";
import { createPostAction } from "../actions";
import { PostFields } from "../post-fields";

export function NewPostForm({ workspaceSlug }: { workspaceSlug: string }) {
  const [state, formAction, isPending] = useActionState(createPostAction, null);
  return (
    <form action={formAction} className="form">
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <PostFields />
      {state?.error && <div className="auth-error">{state.error}</div>}
      {state?.fieldErrors?.body && <div className="auth-error">{state.fieldErrors.body[0]}</div>}
      <button type="submit" className="btn primary" disabled={isPending} style={{ justifySelf: "start" }}>
        {isPending ? "Saving…" : "Save as draft"}
      </button>
    </form>
  );
}

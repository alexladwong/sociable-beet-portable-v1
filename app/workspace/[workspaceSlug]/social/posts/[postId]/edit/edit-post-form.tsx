"use client";

import { useActionState } from "react";
import type { SocialPost } from "@prisma/client";
import { editPostAction } from "../../../actions";
import { PostFields } from "../../../post-fields";

export function EditPostForm({ workspaceSlug, post }: { workspaceSlug: string; post: SocialPost }) {
  const [state, formAction, isPending] = useActionState(editPostAction, null);
  return (
    <form action={formAction} className="form">
      <input type="hidden" name="workspaceSlug" value={workspaceSlug} />
      <input type="hidden" name="postId" value={post.id} />
      <PostFields
        defaults={{ title: post.title, body: post.body, type: post.type, channels: post.channels, hashtags: post.hashtags }}
      />
      {state?.error && <div className="auth-error">{state.error}</div>}
      {state?.fieldErrors?.body && <div className="auth-error">{state.fieldErrors.body[0]}</div>}
      <button type="submit" className="btn primary" disabled={isPending} style={{ justifySelf: "start" }}>
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireWorkspaceMembership, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { canManageProjects } from "@/lib/permissions/roles";
import { getWorkspacePost } from "@/lib/social";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { UserAvatar } from "@/components/workspace/user-avatar";
import {
  submitPostAction,
  approvePostAction,
  sendBackPostAction,
  schedulePostAction,
  publishPostAction,
  commentAction,
} from "../../actions";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  created: "created the draft",
  edited: "edited the draft",
  submitted: "submitted for review",
  approved: "approved",
  sent_back: "sent back to draft",
  scheduled: "scheduled",
  published: "published",
};

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function hidden(name: string, value: string) {
  return <input type="hidden" name={name} value={value} />;
}

export default async function SocialPostDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; postId: string }>;
}) {
  const { workspaceSlug, postId } = await params;
  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const [memberships, post] = await Promise.all([
    listMembershipsForProfile(profile.id),
    getWorkspacePost(workspace.id, postId),
  ]);
  if (!post) notFound();

  const canManage = canManageProjects(membership.role);
  const isAuthor = post.authorProfileId === profile.id;
  const canEditDraft = canManage || isAuthor;
  const isMember = canManage || membership.role === "MEMBER";

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Social" title={post.title || "Social post"}>
      <section className="hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <p className="small" style={{ marginTop: 0 }}>
            <Link href={`/workspace/${workspaceSlug}/social`}>← Social Studio</Link>
          </p>
          <h1>{post.title || "Untitled post"}</h1>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            <span className="pill">{post.status.replace(/_/g, " ")}</span>
            <span className="pill">{post.type[0] + post.type.slice(1).toLowerCase()}</span>
            {post.channels.map((c) => <span className="pill" key={c}>{c}</span>)}
            {post.hashtags.map((h) => <span className="pill" key={h}>#{h}</span>)}
          </div>
        </div>
      </section>

      <div className="grid two" style={{ alignItems: "start", marginTop: 18 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div className="card social">
            <blockquote style={{ marginTop: 0 }}>{post.body}</blockquote>
            <div className="small" style={{ marginTop: 12 }}>
              {post.author && <>Author: {post.author.name || post.author.email}</>}
              {post.reviewer && <> · Reviewed: {post.reviewer.name || post.reviewer.email}</>}
              {post.approver && <> · Approved: {post.approver.name || post.approver.email}</>}
            </div>
            <div className="small" style={{ marginTop: 6 }}>
              {post.scheduledAt && <>Scheduled: {formatWhen(post.scheduledAt)}</>}
              {post.publishedAt && <> · Published: {formatWhen(post.publishedAt)}</>}
            </div>
          </div>

          {(post.status === "DRAFT" || post.status === "IN_REVIEW" || post.status === "APPROVED" || post.status === "SCHEDULED") && isMember && (
            <div className="card">
              <h2 className="section-title">Workflow</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {post.status === "DRAFT" && canEditDraft && (
                  <>
                    <Link href={`/workspace/${workspaceSlug}/social/posts/${postId}/edit`} className="btn">Edit draft</Link>
                    <form action={submitPostAction}>
                      {hidden("workspaceSlug", workspaceSlug)}
                      {hidden("postId", postId)}
                      <button type="submit" className="btn primary">Submit for review</button>
                    </form>
                  </>
                )}
                {post.status === "IN_REVIEW" && canManage && (
                  <>
                    <form action={approvePostAction}>
                      {hidden("workspaceSlug", workspaceSlug)}
                      {hidden("postId", postId)}
                      <button type="submit" className="btn primary">Approve</button>
                    </form>
                    <form action={sendBackPostAction}>
                      {hidden("workspaceSlug", workspaceSlug)}
                      {hidden("postId", postId)}
                      <button type="submit" className="btn">Send back to draft</button>
                    </form>
                  </>
                )}
                {post.status === "APPROVED" && canManage && (
                  <>
                    <form action={schedulePostAction}>
                      {hidden("workspaceSlug", workspaceSlug)}
                      {hidden("postId", postId)}
                      <input type="datetime-local" name="scheduledAt" required aria-label="Scheduled time" />
                      <button type="submit" className="btn primary" style={{ marginTop: 8 }}>Schedule</button>
                    </form>
                    <form action={publishPostAction}>
                      {hidden("workspaceSlug", workspaceSlug)}
                      {hidden("postId", postId)}
                      <button type="submit" className="btn">Publish now</button>
                    </form>
                  </>
                )}
                {post.status === "SCHEDULED" && canManage && (
                  <form action={publishPostAction}>
                    {hidden("workspaceSlug", workspaceSlug)}
                    {hidden("postId", postId)}
                    <button type="submit" className="btn primary">Publish now</button>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="section-title">Comments ({post.comments.length})</h2>
            {post.comments.length === 0 ? (
              <p className="small">No comments yet. Reviewers and authors can discuss the post here.</p>
            ) : (
              post.comments.map((c) => (
                <div className="row" key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <UserAvatar name={c.author?.name} email={c.author?.email} image={c.author?.avatarUrl} size={26} />
                  <div style={{ minWidth: 0 }}>
                    <div className="small">
                      <strong>{c.author?.name || c.author?.email || "Someone"}</strong> · {formatWhen(c.createdAt)}
                    </div>
                    <div style={{ marginTop: 2, whiteSpace: "pre-wrap" }}>{c.body}</div>
                  </div>
                </div>
              ))
            )}
            {isMember && (
              <form action={commentAction} className="form" style={{ marginTop: 12 }}>
                {hidden("workspaceSlug", workspaceSlug)}
                {hidden("postId", postId)}
                <textarea name="body" rows={2} placeholder="Leave a comment…" required minLength={2} />
                <button type="submit" className="btn" style={{ justifySelf: "start" }}>Comment</button>
              </form>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">History</h2>
          {post.events.length === 0 ? (
            <p className="small">No activity yet.</p>
          ) : (
            post.events.map((e) => (
              <div className="row" key={e.id}>
                <div className="small">
                  <strong>{e.actor?.name || e.actor?.email || "Someone"}</strong> {ACTION_LABEL[e.action] || e.action}
                </div>
                <div className="meta">{formatWhen(e.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireWorkspaceMembership, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { canManageProjects } from "@/lib/permissions/roles";
import { getWorkspacePost } from "@/lib/social";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { EditPostForm } from "./edit-post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
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
  const isAuthor = post.authorProfileId === profile.id;
  const canManage = canManageProjects(membership.role);
  if (!isAuthor && !canManage) notFound();
  if (post.status !== "DRAFT") notFound();

  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Social" title="Edit post">
      <section className="hero">
        <h1>Edit draft</h1>
        <p>
          <Link className="small" href={`/workspace/${workspaceSlug}/social/posts/${postId}`}>← Back to post</Link>
        </p>
      </section>
      <div className="card" style={{ maxWidth: 640 }}>
        <EditPostForm workspaceSlug={workspaceSlug} post={post} />
      </div>
    </WorkspaceShell>
  );
}

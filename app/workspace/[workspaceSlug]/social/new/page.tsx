import { requireWorkspaceRole, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { NewPostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage({ params }: { params: Promise<{ workspaceSlug: string }> }) {
  const { workspaceSlug } = await params;
  const { profile, membership, workspace } = await requireWorkspaceRole(workspaceSlug, "MEMBER");
  const memberships = await listMembershipsForProfile(profile.id);
  return (
    <WorkspaceShell workspace={workspace} membership={membership} profile={profile} memberships={memberships} active="Social" title="New post">
      <section className="hero">
        <h1>New post</h1>
        <p>Draft inspirational content for your workspace.</p>
      </section>
      <div className="card" style={{ maxWidth: 640 }}>
        <NewPostForm workspaceSlug={workspaceSlug} />
      </div>
    </WorkspaceShell>
  );
}

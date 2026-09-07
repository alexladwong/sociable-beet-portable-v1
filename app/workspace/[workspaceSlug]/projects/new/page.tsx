import { requireWorkspaceRole, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { NewProjectForm } from "./new-project-form";

export const dynamic = "force-dynamic";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  // Gate the whole page on MANAGER+ - enforced again server-side in the action itself.
  const { profile, membership, workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");
  const memberships = await listMembershipsForProfile(profile.id);

  return (
    <WorkspaceShell
      workspace={workspace}
      membership={membership}
      profile={profile}
      memberships={memberships}
      active="Projects"
      title="New project"
    >
      <section className="hero">
        <h1>New project</h1>
        <p>Add a new project to {workspace.name}.</p>
      </section>
      <div className="card" style={{ maxWidth: 560 }}>
        <NewProjectForm workspaceSlug={workspaceSlug} />
      </div>
    </WorkspaceShell>
  );
}

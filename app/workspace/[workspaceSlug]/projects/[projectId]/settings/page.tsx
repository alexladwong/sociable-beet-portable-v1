import { notFound } from "next/navigation";
import { requireWorkspaceRole, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { canDeleteProjects } from "@/lib/permissions/roles";
import { getWorkspaceProject } from "@/lib/projects";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { ConfirmSubmitButton } from "@/components/workspace/confirm-submit-button";
import { archiveProjectAction, restoreProjectAction, deleteProjectAction } from "../actions";
import { EditProjectForm } from "./edit-project-form";

export const dynamic = "force-dynamic";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = await params;
  // MANAGER+ can edit; ADMIN+ (checked below) can also archive/delete.
  const { profile, membership, workspace } = await requireWorkspaceRole(workspaceSlug, "MANAGER");
  const [memberships, project] = await Promise.all([
    listMembershipsForProfile(profile.id),
    getWorkspaceProject(workspace.id, projectId),
  ]);

  if (!project) notFound();

  const canDelete = canDeleteProjects(membership.role);
  const archiveAction = archiveProjectAction.bind(null, workspaceSlug, projectId);
  const restoreAction = restoreProjectAction.bind(null, workspaceSlug, projectId);
  const deleteAction = deleteProjectAction.bind(null, workspaceSlug, projectId);

  return (
    <WorkspaceShell
      workspace={workspace}
      membership={membership}
      profile={profile}
      memberships={memberships}
      active="Projects"
      title={`${project.name} · Settings`}
    >
      <section className="hero">
        <h1>Project settings</h1>
        <p>Update details for {project.name}.</p>
      </section>

      <div className="card" style={{ maxWidth: 560 }}>
        <EditProjectForm workspaceSlug={workspaceSlug} project={project} />
      </div>

      {canDelete && (
        <div className="card" style={{ maxWidth: 560, marginTop: 16 }}>
          <h2 className="section-title">Danger zone</h2>
          <p className="small" style={{ marginBottom: 12 }}>
            Archiving hides this project from active views but keeps its data. Deleting removes it permanently.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {project.status !== "ARCHIVED" ? (
              <form action={archiveAction}>
                <button type="submit" className="btn">Archive project</button>
              </form>
            ) : (
              <form action={restoreAction}>
                <button type="submit" className="btn">Restore project</button>
              </form>
            )}
            <form action={deleteAction}>
              <ConfirmSubmitButton
                className="btn"
                confirmMessage={`Permanently delete "${project.name}"? This cannot be undone.`}
              >
                <span style={{ color: "#c0392b" }}>Delete permanently</span>
              </ConfirmSubmitButton>
            </form>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

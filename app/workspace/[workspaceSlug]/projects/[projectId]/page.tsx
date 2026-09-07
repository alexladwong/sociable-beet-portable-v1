import { notFound } from "next/navigation";
import Link from "next/link";
import { requireWorkspaceMembership, listMembershipsForProfile } from "@/lib/permissions/workspace";
import { canManageProjects, canDeleteProjects } from "@/lib/permissions/roles";
import { getWorkspaceProject } from "@/lib/projects";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { ConfirmSubmitButton } from "@/components/workspace/confirm-submit-button";
import { archiveProjectAction, restoreProjectAction, deleteProjectAction } from "./actions";

export const dynamic = "force-dynamic";

const TABS = ["overview", "tasks", "activity", "files"] as const;
type Tab = (typeof TABS)[number];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { workspaceSlug, projectId } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(tabParam || "") ? (tabParam as Tab) : "overview";

  const { profile, membership, workspace } = await requireWorkspaceMembership(workspaceSlug);
  const [memberships, project] = await Promise.all([
    listMembershipsForProfile(profile.id),
    // Scoped by workspace.id + projectId together - a project from another
    // workspace can never be returned here, even if its id is guessed.
    getWorkspaceProject(workspace.id, projectId),
  ]);

  if (!project) notFound();

  const canEdit = canManageProjects(membership.role);
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
      title={project.name}
    >
      <section
        className="hero"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}
      >
        <div>
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
        <span className="pill">{project.status}</span>
      </section>

      <div className="project-tabs">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/workspace/${workspaceSlug}/projects/${projectId}?tab=${t}`}
            className={`nav-item project-tab${tab === t ? " active" : ""}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </Link>
        ))}
        {canEdit && (
          <Link
            href={`/workspace/${workspaceSlug}/projects/${projectId}/settings`}
            className="nav-item project-tab"
            style={{ marginLeft: "auto" }}
          >
            Settings
          </Link>
        )}
      </div>

      {tab === "overview" ? (
        <>
          <section className="grid metrics" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            <div className="card">
              <div className="label">Status</div>
              <div className="value" style={{ fontSize: 18 }}>{project.status}</div>
            </div>
            <div className="card">
              <div className="label">Priority</div>
              <div className="value" style={{ fontSize: 18 }}>{project.priority}</div>
            </div>
            <div className="card">
              <div className="label">Progress</div>
              <div className="value" style={{ fontSize: 18 }}>{project.progress}%</div>
              <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
            </div>
            <div className="card">
              <div className="label">Tasks</div>
              <div className="value" style={{ fontSize: 18 }}>{project.tasks.length}</div>
            </div>
          </section>

          <div className="card" style={{ marginTop: 16 }}>
            <h2 className="section-title">Details</h2>
            <div className="row">
              <strong>Start date</strong>
              <div className="meta">{project.startDate ? project.startDate.toLocaleDateString() : "Not set"}</div>
            </div>
            <div className="row">
              <strong>Due date</strong>
              <div className="meta">{project.dueDate ? project.dueDate.toLocaleDateString() : "Not set"}</div>
            </div>
            <div className="row">
              <strong>Created</strong>
              <div className="meta">
                {project.createdAt.toLocaleDateString()}
                {project.creator ? ` by ${project.creator.name || project.creator.email}` : ""}
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="card" style={{ marginTop: 16 }}>
              <h2 className="section-title">Actions</h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {canEdit && (
                  <Link href={`/workspace/${workspaceSlug}/projects/${projectId}/settings`} className="btn">
                    Edit project
                  </Link>
                )}
                {canDelete && project.status !== "ARCHIVED" && (
                  <form action={archiveAction}>
                    <button type="submit" className="btn">Archive project</button>
                  </form>
                )}
                {canDelete && project.status === "ARCHIVED" && (
                  <form action={restoreAction}>
                    <button type="submit" className="btn">Restore project</button>
                  </form>
                )}
                {canDelete && (
                  <form action={deleteAction}>
                    <ConfirmSubmitButton
                      className="btn"
                      confirmMessage={`Permanently delete "${project.name}"? This cannot be undone.`}
                    >
                      <span style={{ color: "#c0392b" }}>Delete permanently</span>
                    </ConfirmSubmitButton>
                  </form>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <h2 className="section-title">{tab[0].toUpperCase() + tab.slice(1)}</h2>
          <p className="small">Coming next - {tab} for this project will live here.</p>
        </div>
      )}
    </WorkspaceShell>
  );
}

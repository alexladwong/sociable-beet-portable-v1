import Link from "next/link";
import type { Project, ProjectStatus, Task } from "@prisma/client";
import { EmptyState } from "@/components/workspace/empty-state";
import type { ProjectSort } from "@/lib/projects";

type ProjectWithTasks = Project & { tasks: Task[] };

export function ProjectsList({
  workspaceSlug,
  workspaceName,
  projects,
  canCreate,
  query,
  status,
  sort,
  statusOptions,
}: {
  workspaceSlug: string;
  workspaceName: string;
  projects: ProjectWithTasks[];
  canCreate: boolean;
  query: string;
  status: string;
  sort: ProjectSort;
  statusOptions: ProjectStatus[];
}) {
  const isFiltered = Boolean(query || status);

  return (
    <>
      <section className="hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1>Projects</h1>
          <p>{projects.length} project{projects.length === 1 ? "" : "s"} in {workspaceName}</p>
        </div>
        {canCreate && (
          <Link href={`/workspace/${workspaceSlug}/projects/new`} className="btn primary">
            New Project
          </Link>
        )}
      </section>

      <form method="get" className="card" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20, alignItems: "center" }}>
        <input type="text" name="q" placeholder="Search projects…" defaultValue={query} style={{ maxWidth: 240 }} />
        <select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="sort" defaultValue={sort}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A-Z)</option>
          <option value="dueDate">Due date</option>
        </select>
        <button type="submit" className="btn">Apply</button>
        {isFiltered && (
          <Link href={`/workspace/${workspaceSlug}/projects`} className="small">Clear filters</Link>
        )}
      </form>

      <div className="card" style={{ marginTop: 16 }}>
        {projects.length === 0 ? (
          <EmptyState
            message={
              isFiltered
                ? "No projects match your filters."
                : "No projects yet. Create your first project to start organizing your team's work."
            }
            action={
              !isFiltered && canCreate
                ? { label: "Create project", href: `/workspace/${workspaceSlug}/projects/new` }
                : undefined
            }
          />
        ) : (
          projects.map((project) => (
            <Link
              className="row row-link"
              href={`/workspace/${workspaceSlug}/projects/${project.id}`}
              key={project.id}
            >
              <strong>{project.name}</strong>
              <div className="meta">
                {project.tasks.length} task{project.tasks.length === 1 ? "" : "s"} · {project.status} · {project.priority}
                {project.dueDate ? ` · Due ${project.dueDate.toLocaleDateString()}` : ""}
              </div>
              <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

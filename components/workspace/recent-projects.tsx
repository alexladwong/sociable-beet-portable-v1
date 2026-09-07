import Link from "next/link";
import type { Project, Task } from "@prisma/client";
import { EmptyState } from "./empty-state";

type ProjectWithTasks = Project & { tasks: Task[] };

export function RecentProjects({
  projects,
  workspaceSlug,
  canCreate,
}: {
  projects: ProjectWithTasks[];
  workspaceSlug: string;
  canCreate: boolean;
}) {
  return (
    <div className="card">
      <h2 className="section-title">Recent Projects</h2>
      {projects.length === 0 ? (
        <EmptyState
          message="No projects yet. Create your first project to start organizing work."
          action={
            canCreate
              ? { label: "Create project", href: `/workspace/${workspaceSlug}/projects/new` }
              : undefined
          }
        />
      ) : (
        projects.map((project) => (
          <Link className="row row-link" href={`/workspace/${workspaceSlug}/projects/${project.id}`} key={project.id}>
            <strong>{project.name}</strong>
            <div className="meta">
              {project.tasks.length} task{project.tasks.length === 1 ? "" : "s"} · {project.status}
              {project.dueDate ? ` · Due ${project.dueDate.toLocaleDateString()}` : ""}
            </div>
            <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
          </Link>
        ))
      )}
    </div>
  );
}

import type { Project, Task } from "@prisma/client";
import { EmptyState } from "./empty-state";

type ProjectWithTasks = Project & { tasks: Task[] };

export function RecentProjects({ projects }: { projects: ProjectWithTasks[] }) {
  return (
    <div className="card">
      <h2 className="section-title">Recent Projects</h2>
      {projects.length === 0 ? (
        <EmptyState
          message="No projects yet. Create your first project to start organizing work."
          action={{ label: "Create project", disabled: true }}
        />
      ) : (
        projects.map((project) => (
          <div className="row" key={project.id}>
            <strong>{project.name}</strong>
            <div className="meta">
              {project.tasks.length} task{project.tasks.length === 1 ? "" : "s"} · {project.status}
              {project.dueDate ? ` · Due ${project.dueDate.toLocaleDateString()}` : ""}
            </div>
            <div className="progress"><span style={{ width: `${project.progress}%` }} /></div>
          </div>
        ))
      )}
    </div>
  );
}

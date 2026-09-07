"use client";

import { useActionState } from "react";
import type { Project } from "@prisma/client";
import { updateProjectAction } from "../actions";
import { ProjectForm } from "../../project-form";
import { ALL_PROJECT_STATUSES } from "../../schema";

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EditProjectForm({
  workspaceSlug,
  project,
}: {
  workspaceSlug: string;
  project: Project;
}) {
  const action = updateProjectAction.bind(null, workspaceSlug, project.id);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <ProjectForm
      formAction={formAction}
      isPending={isPending}
      error={state?.error}
      fieldErrors={state?.fieldErrors}
      showProgress
      statusOptions={ALL_PROJECT_STATUSES}
      defaultValues={{
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: toDateInputValue(project.startDate),
        dueDate: toDateInputValue(project.dueDate),
        progress: project.progress,
      }}
      submitLabel="Save changes"
    />
  );
}

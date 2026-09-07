"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";
import { ProjectForm } from "../project-form";

export function NewProjectForm({ workspaceSlug }: { workspaceSlug: string }) {
  const action = createProjectAction.bind(null, workspaceSlug);
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <ProjectForm
      formAction={formAction}
      isPending={isPending}
      error={state?.error}
      fieldErrors={state?.fieldErrors}
      submitLabel="Create project"
    />
  );
}

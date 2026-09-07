"use client";

import { useActionState } from "react";
import { createProjectAction } from "./actions";
import { ProjectForm } from "../project-form";

export function NewProjectForm({ workspaceSlug }: { workspaceSlug: string }) {
  const [state, formAction, isPending] = useActionState(createProjectAction, null);

  return (
    <ProjectForm
      formAction={formAction}
      isPending={isPending}
      error={state?.error}
      fieldErrors={state?.fieldErrors}
      hiddenFields={{ workspaceSlug }}
      submitLabel="Create project"
    />
  );
}

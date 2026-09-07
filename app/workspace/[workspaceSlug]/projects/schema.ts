import { z } from "zod";
import { ProjectStatus, Priority } from "@prisma/client";

// The "new project" form only offers these - starting a brand-new project as
// already-archived doesn't make sense. ACTIVE is listed first so a new project
// starts life as a live one by default (the dashboard's "Active Projects"
// counter tracks status ACTIVE). The edit form shows the full enum
// (ALL_PROJECT_STATUSES below) so an already-archived project still renders
// correctly there. Validation accepts the full Prisma enum either way.
export const CREATABLE_PROJECT_STATUSES = ["ACTIVE", "PLANNING", "REVIEW", "COMPLETED"] as const;
export const ALL_PROJECT_STATUSES = Object.values(ProjectStatus);
export const PROJECT_PRIORITIES = Object.values(Priority);

export const projectInputSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long"),
    description: z
      .string()
      .trim()
      .max(2000, "Description is too long")
      .optional()
      .transform((v) => (v ? v : null)),
    status: z.nativeEnum(ProjectStatus),
    priority: z.nativeEnum(Priority),
    startDate: z
      .string()
      .optional()
      .transform((v) => (v ? v : null)),
    dueDate: z
      .string()
      .optional()
      .transform((v) => (v ? v : null)),
  })
  .refine((data) => !data.startDate || !data.dueDate || data.startDate <= data.dueDate, {
    message: "Due date must be on or after the start date.",
    path: ["dueDate"],
  });

export type ProjectFormValues = z.infer<typeof projectInputSchema>;

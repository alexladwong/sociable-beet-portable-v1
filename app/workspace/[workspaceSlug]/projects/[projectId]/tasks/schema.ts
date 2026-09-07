import { z } from "zod";
import { TaskStatus, Priority } from "@prisma/client";

// Same conventions as projects/schema.ts: shared between the server actions
// and the client forms (option lists), full enums from Prisma.
export const ALL_TASK_STATUSES = Object.values(TaskStatus);
export const TASK_PRIORITIES = Object.values(Priority);

export const taskInputSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(200, "Title is too long"),
  description: z
    .string()
    .trim()
    .max(2000, "Description is too long")
    .optional()
    .transform((v) => (v ? v : null)),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(Priority),
  dueDate: z
    .string()
    .optional()
    .transform((v) => (v ? v : null)),
});

export type TaskFormValues = z.infer<typeof taskInputSchema>;

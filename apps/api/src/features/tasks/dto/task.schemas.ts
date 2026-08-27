import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";

export const taskPrioritySchema = z.nativeEnum(Priority);

const emptyToUndefined = (value: unknown): unknown => (value === "" ? undefined : value);

export const createTaskSchema = z.object({
  description: z.preprocess(emptyToUndefined, z.string().max(2000).optional()),
  dueAt: z.preprocess(emptyToUndefined, z.string().datetime().optional()),
  dueDate: z.preprocess(emptyToUndefined, z.string().date().optional()),
  estimatedMinutes: z.number().int().min(1).max(1440).optional(),
  isFavorite: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  priority: taskPrioritySchema.optional(),
  title: z.string().trim().min(1).max(240)
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .extend({
    status: z.nativeEnum(TaskStatus).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

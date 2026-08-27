import { Priority, TaskStatus } from "@prisma/client";

export interface TaskResponse {
  completedAt: string | null;
  createdAt: string;
  description: string | null;
  dueAt: string | null;
  dueDate: string | null;
  estimatedMinutes: number | null;
  id: string;
  isFavorite: boolean;
  isPinned: boolean;
  priority: Priority;
  status: TaskStatus;
  title: string;
  updatedAt: string;
}

export interface TaskStatsResponse {
  active: number;
  completed: number;
  completedToday: number;
  focusMinutes: number;
  total: number;
}

export interface TaskListResponse {
  items: TaskResponse[];
  stats: TaskStatsResponse;
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Task, TaskStatus } from "@prisma/client";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { CreateTaskInput, UpdateTaskInput } from "./dto/task.schemas";
import { TaskListResponse, TaskResponse, TaskStatsResponse } from "./types/task.types";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<TaskListResponse> {
    const [items, stats] = await Promise.all([
      this.prisma.task.findMany({
        orderBy: [{ isPinned: "desc" }, { status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
        where: {
          deletedAt: null,
          ownerId: userId,
          status: {
            in: [TaskStatus.ACTIVE, TaskStatus.COMPLETED]
          }
        }
      }),
      this.getStats(userId)
    ]);

    return {
      items: items.map((task) => this.serializeTask(task)),
      stats
    };
  }

  async create(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
    const task = await this.prisma.task.create({
      data: {
        description: input.description,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
        dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : undefined,
        estimatedMinutes: input.estimatedMinutes,
        isFavorite: input.isFavorite,
        isPinned: input.isPinned,
        ownerId: userId,
        priority: input.priority,
        title: input.title
      }
    });

    return this.serializeTask(task);
  }

  async update(userId: string, taskId: string, input: UpdateTaskInput): Promise<TaskResponse> {
    await this.ensureOwnedTask(userId, taskId);

    const data: Prisma.TaskUpdateInput = {
      description: input.description,
      dueAt: input.dueAt ? new Date(input.dueAt) : input.dueAt === undefined ? undefined : null,
      dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : input.dueDate === undefined ? undefined : null,
      estimatedMinutes: input.estimatedMinutes,
      isFavorite: input.isFavorite,
      isPinned: input.isPinned,
      priority: input.priority,
      status: input.status,
      title: input.title
    };

    if (input.status === TaskStatus.COMPLETED) {
      data.completedAt = new Date();
      data.completionPercentage = 100;
    }

    if (input.status === TaskStatus.ACTIVE) {
      data.completedAt = null;
      data.completionPercentage = 0;
    }

    const task = await this.prisma.task.update({
      data,
      where: {
        id: taskId
      }
    });

    return this.serializeTask(task);
  }

  async remove(userId: string, taskId: string): Promise<{ message: string }> {
    await this.ensureOwnedTask(userId, taskId);

    await this.prisma.task.update({
      data: {
        deletedAt: new Date(),
        status: TaskStatus.DELETED
      },
      where: {
        id: taskId
      }
    });

    return { message: "Task deleted." };
  }

  private async ensureOwnedTask(userId: string, taskId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({
      select: { id: true },
      where: {
        deletedAt: null,
        id: taskId,
        ownerId: userId
      }
    });

    if (!task) {
      throw new NotFoundException("Task was not found.");
    }
  }

  private async getStats(userId: string): Promise<TaskStatsResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [active, completed, completedToday, aggregate] = await Promise.all([
      this.prisma.task.count({
        where: {
          deletedAt: null,
          ownerId: userId,
          status: TaskStatus.ACTIVE
        }
      }),
      this.prisma.task.count({
        where: {
          deletedAt: null,
          ownerId: userId,
          status: TaskStatus.COMPLETED
        }
      }),
      this.prisma.task.count({
        where: {
          completedAt: {
            gte: today
          },
          deletedAt: null,
          ownerId: userId,
          status: TaskStatus.COMPLETED
        }
      }),
      this.prisma.task.aggregate({
        _sum: {
          estimatedMinutes: true
        },
        where: {
          deletedAt: null,
          ownerId: userId,
          status: {
            in: [TaskStatus.ACTIVE, TaskStatus.COMPLETED]
          }
        }
      })
    ]);

    return {
      active,
      completed,
      completedToday,
      focusMinutes: aggregate._sum.estimatedMinutes ?? 0,
      total: active + completed
    };
  }

  private serializeTask(task: Task): TaskResponse {
    return {
      completedAt: task.completedAt?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
      description: task.description,
      dueAt: task.dueAt?.toISOString() ?? null,
      dueDate: task.dueDate?.toISOString().slice(0, 10) ?? null,
      estimatedMinutes: task.estimatedMinutes,
      id: task.id,
      isFavorite: task.isFavorite,
      isPinned: task.isPinned,
      priority: task.priority,
      status: task.status,
      title: task.title,
      updatedAt: task.updatedAt.toISOString()
    };
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AuthenticatedRequest, JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { createTaskSchema, CreateTaskInput, updateTaskSchema, UpdateTaskInput } from "./dto/task.schemas";
import { TasksService } from "./tasks.service";
import { TaskListResponse, TaskResponse } from "./types/task.types";

@Controller({
  path: "tasks",
  version: "1"
})
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest): Promise<TaskListResponse> {
    return this.tasksService.list(request.user.id);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createTaskSchema)) body: CreateTaskInput
  ): Promise<TaskResponse> {
    return this.tasksService.create(request.user.id, body);
  }

  @Patch(":id")
  update(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) body: UpdateTaskInput
  ): Promise<TaskResponse> {
    return this.tasksService.update(request.user.id, id, body);
  }

  @Delete(":id")
  remove(@Req() request: AuthenticatedRequest, @Param("id") id: string): Promise<{ message: string }> {
    return this.tasksService.remove(request.user.id, id);
  }
}

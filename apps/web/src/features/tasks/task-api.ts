export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "DELETED";

export interface Task {
  completedAt: string | null;
  createdAt: string;
  description: string | null;
  dueAt: string | null;
  dueDate: string | null;
  estimatedMinutes: number | null;
  id: string;
  isFavorite: boolean;
  isPinned: boolean;
  priority: TaskPriority;
  status: TaskStatus;
  title: string;
  updatedAt: string;
}

export interface TaskStats {
  active: number;
  completed: number;
  completedToday: number;
  focusMinutes: number;
  total: number;
}

export interface TaskListResponse {
  items: Task[];
  stats: TaskStats;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    id: string;
    name: string;
  };
}

export interface CreateTaskPayload {
  description?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  priority?: TaskPriority;
  title: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  isFavorite?: boolean;
  isPinned?: boolean;
  status?: TaskStatus;
};

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

async function request<TResponse>(path: string, options: RequestInit & { token?: string } = {}): Promise<TResponse> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = typeof payload?.message === "string" ? payload.message : "Request failed.";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    body: JSON.stringify({
      ...input,
      rememberMe: true
    }),
    method: "POST"
  });
}

export function register(input: { email: string; name: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    body: JSON.stringify({
      ...input,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }),
    method: "POST"
  });
}

export function listTasks(token: string): Promise<TaskListResponse> {
  return request<TaskListResponse>("/tasks", { token });
}

export function createTask(token: string, input: CreateTaskPayload): Promise<Task> {
  return request<Task>("/tasks", {
    body: JSON.stringify(input),
    method: "POST",
    token
  });
}

export function updateTask(token: string, id: string, input: UpdateTaskPayload): Promise<Task> {
  return request<Task>(`/tasks/${id}`, {
    body: JSON.stringify(input),
    method: "PATCH",
    token
  });
}

export function deleteTask(token: string, id: string): Promise<{ message: string }> {
  return request<{ message: string }>(`/tasks/${id}`, {
    method: "DELETE",
    token
  });
}

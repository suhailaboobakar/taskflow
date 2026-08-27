import type * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Inbox,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Pin,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "../../features/theme/theme.store";
import {
  AuthResponse,
  CreateTaskPayload,
  Task,
  TaskListResponse,
  TaskPriority,
  UpdateTaskPayload,
  createTask,
  deleteTask,
  listTasks,
  login,
  register,
  updateTask
} from "../../features/tasks/task-api";
import { Button } from "../../shared/ui/button";
import { GlassPanel } from "../../shared/ui/glass-panel";

const sessionStorageKey = "taskflow.session";
const taskQueryKey = ["tasks"];

const navItems = [
  { label: "Today", icon: CheckCircle2, active: true },
  { label: "Inbox", icon: Inbox },
  { label: "Planning", icon: CalendarDays },
  { label: "Focus", icon: Zap },
  { label: "Favorites", icon: Star }
];

const priorityOptions: TaskPriority[] = ["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"];

const emptyTaskResponse: TaskListResponse = {
  items: [],
  stats: {
    active: 0,
    completed: 0,
    completedToday: 0,
    focusMinutes: 0,
    total: 0
  }
};

export function AppShell(): React.JSX.Element {
  const [session, setSession] = useState<AuthResponse | null>(() => readSession());
  const queryClient = useQueryClient();
  const token = session?.accessToken;

  useEffect(() => {
    if (session) {
      localStorage.setItem(sessionStorageKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(sessionStorageKey);
      queryClient.removeQueries({ queryKey: taskQueryKey });
    }
  }, [queryClient, session]);

  const taskQuery = useQuery({
    enabled: Boolean(token),
    queryFn: () => listTasks(token ?? ""),
    queryKey: taskQueryKey
  });

  const taskData = taskQuery.data ?? emptyTaskResponse;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackdrop />
      <div className="relative z-10 grid min-h-screen grid-cols-1 gap-4 p-3 md:grid-cols-[260px_1fr] md:p-5">
        <Sidebar session={session} />
        <section className="flex min-w-0 flex-col gap-4">
          <TopBar session={session} onLogout={() => setSession(null)} />
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <TaskCanvas isLoading={taskQuery.isLoading} session={session} setSession={setSession} taskData={taskData} token={token} />
            <InsightRail isConnected={Boolean(session)} stats={taskData.stats} />
          </div>
        </section>
      </div>
    </main>
  );
}

function AnimatedBackdrop(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(129,140,248,0.20),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.80),rgba(236,253,245,0.46))] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_80%_12%,rgba(20,184,166,0.18),transparent_30%),linear-gradient(135deg,rgba(2,6,23,1),rgba(15,23,42,0.96))]" />
      <div className="absolute left-[8%] top-[12%] size-72 animate-drift rounded-full bg-cyan-300/24 blur-3xl dark:bg-cyan-500/16" />
      <div className="absolute bottom-[8%] right-[10%] size-80 animate-drift rounded-full bg-indigo-300/24 blur-3xl [animation-delay:4s] dark:bg-teal-400/14" />
    </div>
  );
}

function Sidebar({ session }: { session: AuthResponse | null }): React.JSX.Element {
  return (
    <motion.aside animate={{ opacity: 1, x: 0 }} className="hidden md:block" initial={{ opacity: 0, x: -18 }} transition={{ duration: 0.45, ease: "easeOut" }}>
      <GlassPanel className="flex h-[calc(100vh-40px)] flex-col p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{session ? session.user.email : "Premium workspace"}</p>
            <h1 className="text-xl font-semibold">Taskflow</h1>
          </div>
        </div>
        <nav className="space-y-2" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm transition duration-200 hover:translate-x-1 hover:bg-white/28 dark:hover:bg-white/10 ${
                  item.active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground"
                }`}
                key={item.label}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl border border-white/28 bg-white/24 p-4 dark:border-white/10 dark:bg-white/8">
          <p className="text-sm font-medium">Focus plan</p>
          <p className="mt-1 text-sm text-muted-foreground">Phase 7 is active with protected task CRUD and optimistic updates.</p>
        </div>
      </GlassPanel>
    </motion.aside>
  );
}

function TopBar({ onLogout, session }: { onLogout: () => void; session: AuthResponse | null }): React.JSX.Element {
  return (
    <GlassPanel className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground md:hidden">
          <LayoutDashboard aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Thursday, August 27</p>
          <h2 className="truncate text-2xl font-semibold">Today's command center</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button aria-label="Search" type="button" variant="icon">
          <Search aria-hidden="true" className="size-4" />
        </Button>
        <Button aria-label="Notifications" type="button" variant="icon">
          <Bell aria-hidden="true" className="size-4" />
        </Button>
        {session ? (
          <Button aria-label="Log out" onClick={onLogout} type="button" variant="icon">
            <LogOut aria-hidden="true" className="size-4" />
          </Button>
        ) : null}
        <ThemeToggle />
      </div>
    </GlassPanel>
  );
}

function TaskCanvas({
  isLoading,
  session,
  setSession,
  taskData,
  token
}: {
  isLoading: boolean;
  session: AuthResponse | null;
  setSession: (session: AuthResponse | null) => void;
  taskData: TaskListResponse;
  token?: string;
}): React.JSX.Element {
  const activeTasks = useMemo(() => taskData.items.filter((task) => task.status === "ACTIVE"), [taskData.items]);
  const completedTasks = useMemo(() => taskData.items.filter((task) => task.status === "COMPLETED"), [taskData.items]);
  const metrics = [
    { label: "Completed today", value: String(taskData.stats.completedToday), tone: "from-sky-400 to-indigo-500" },
    { label: "Open tasks", value: String(taskData.stats.active), tone: "from-teal-300 to-emerald-500" },
    { label: "Focus minutes", value: String(taskData.stats.focusMinutes), tone: "from-rose-300 to-orange-400" }
  ];

  return (
    <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 16 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <GlassPanel className="min-h-[calc(100vh-132px)] p-4 md:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          {metrics.map((metric) => (
            <div className="rounded-3xl border border-white/28 bg-white/30 p-4 dark:border-white/10 dark:bg-white/8" key={metric.label}>
              <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${metric.tone}`} />
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        {session && token ? (
          <TaskWorkspace activeTasks={activeTasks} completedTasks={completedTasks} isLoading={isLoading} token={token} />
        ) : (
          <SessionPanel setSession={setSession} />
        )}
      </GlassPanel>
    </motion.div>
  );
}

function SessionPanel({ setSession }: { setSession: (session: AuthResponse) => void }): React.JSX.Element {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      if (mode === "login") {
        return login({ email, password });
      }

      return register({
        email,
        name: String(formData.get("name") ?? ""),
        password
      });
    },
    onError: (nextError) => setError(nextError instanceof Error ? nextError.message : "Authentication failed."),
    onSuccess: (response) => {
      setError(null);
      setSession(response);
    }
  });

  return (
    <div className="mt-6 rounded-[28px] border border-white/28 bg-white/24 p-6 dark:border-white/10 dark:bg-white/8">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Protected workspace</p>
            <h3 className="mt-1 text-2xl font-semibold">Sign in to manage tasks</h3>
          </div>
          <div className="flex rounded-full bg-muted p-1">
            {(["login", "register"] as const).map((item) => (
              <button
                className={`h-9 rounded-full px-4 text-sm font-medium transition ${mode === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                key={item}
                onClick={() => {
                  setError(null);
                  setMode(item);
                }}
                type="button"
              >
                {item === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>
        </div>
        <form
          className="mt-6 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate(new FormData(event.currentTarget));
          }}
        >
          {mode === "register" ? <Input label="Name" name="name" placeholder="Avery Stone" required /> : null}
          <Input label="Email" name="email" placeholder="avery@example.com" required type="email" />
          <Input label="Password" minLength={12} name="password" placeholder="At least 12 characters" required type="password" />
          {error ? <p className="rounded-2xl bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">{error}</p> : null}
          <Button disabled={mutation.isPending} type="submit">
            <Check aria-hidden="true" className="size-4" />
            {mutation.isPending ? "Connecting" : mode === "login" ? "Open workspace" : "Create workspace"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function TaskWorkspace({
  activeTasks,
  completedTasks,
  isLoading,
  token
}: {
  activeTasks: Task[];
  completedTasks: Task[];
  isLoading: boolean;
  token: string;
}): React.JSX.Element {
  return (
    <div className="mt-6 grid gap-5">
      <QuickAddTask token={token} />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <TaskList emptyLabel={isLoading ? "Loading tasks" : "Your active list is clear"} tasks={activeTasks} title="Active" token={token} />
        <TaskList emptyLabel="Completed tasks land here" tasks={completedTasks} title="Completed" token={token} />
      </div>
    </div>
  );
}

function QuickAddTask({ token }: { token: string }): React.JSX.Element {
  const queryClient = useQueryClient();
  const [priority, setPriority] = useState<TaskPriority>("NONE");
  const mutation = useMutation({
    mutationFn: (input: CreateTaskPayload) => createTask(token, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: taskQueryKey });
      const previous = queryClient.getQueryData<TaskListResponse>(taskQueryKey);
      const optimisticTask = makeOptimisticTask(input, priority);
      queryClient.setQueryData<TaskListResponse>(taskQueryKey, (current) => addOptimisticTask(current, optimisticTask));
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(taskQueryKey, context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskQueryKey })
  });

  return (
    <form
      className="grid gap-3 rounded-[28px] border border-white/28 bg-white/24 p-4 dark:border-white/10 dark:bg-white/8"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        if (!title) {
          return;
        }

        mutation.mutate({
          description: String(formData.get("description") ?? "").trim() || undefined,
          dueDate: String(formData.get("dueDate") ?? "") || undefined,
          estimatedMinutes: Number(formData.get("estimatedMinutes") || 0) || undefined,
          priority,
          title
        });
        event.currentTarget.reset();
        setPriority("NONE");
      }}
    >
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Task title</span>
          <input
            className="h-12 w-full rounded-2xl border border-white/28 bg-white/60 px-4 text-sm outline-none transition focus:border-primary dark:border-white/10 dark:bg-white/10"
            name="title"
            placeholder="Add a task and press Enter"
          />
        </label>
        <label>
          <span className="sr-only">Due date</span>
          <input className="h-12 rounded-2xl border border-white/28 bg-white/60 px-4 text-sm dark:border-white/10 dark:bg-white/10" name="dueDate" type="date" />
        </label>
        <label>
          <span className="sr-only">Estimated minutes</span>
          <input
            className="h-12 w-28 rounded-2xl border border-white/28 bg-white/60 px-4 text-sm dark:border-white/10 dark:bg-white/10"
            min={1}
            name="estimatedMinutes"
            placeholder="Min"
            type="number"
          />
        </label>
        <Button disabled={mutation.isPending} type="submit">
          <Plus aria-hidden="true" className="size-4" />
          Add
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {priorityOptions.map((item) => (
          <button
            className={`h-8 rounded-full px-3 text-xs font-medium transition ${
              priority === item ? "bg-primary text-primary-foreground" : "bg-white/34 text-muted-foreground dark:bg-white/8"
            }`}
            key={item}
            onClick={() => setPriority(item)}
            type="button"
          >
            {formatPriority(item)}
          </button>
        ))}
      </div>
      <textarea
        className="min-h-20 rounded-2xl border border-white/28 bg-white/60 px-4 py-3 text-sm outline-none transition focus:border-primary dark:border-white/10 dark:bg-white/10"
        name="description"
        placeholder="Notes, context, or next action"
      />
    </form>
  );
}

function TaskList({ emptyLabel, tasks, title, token }: { emptyLabel: string; tasks: Task[]; title: string; token: string }): React.JSX.Element {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="rounded-full bg-white/32 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-white/8">{tasks.length}</span>
      </div>
      <div className="grid gap-3">
        {tasks.length > 0 ? tasks.map((task) => <TaskCard key={task.id} task={task} token={token} />) : <EmptyTaskState label={emptyLabel} />}
      </div>
    </section>
  );
}

function TaskCard({ task, token }: { task: Task; token: string }): React.JSX.Element {
  const queryClient = useQueryClient();
  const patchMutation = useMutation({
    mutationFn: (input: { id: string; patch: UpdateTaskPayload }) => updateTask(token, input.id, input.patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: taskQueryKey });
      const previous = queryClient.getQueryData<TaskListResponse>(taskQueryKey);
      queryClient.setQueryData<TaskListResponse>(taskQueryKey, (current) => patchTask(current, id, patch));
      return { previous };
    },
    onError: (_error, _input, context) => queryClient.setQueryData(taskQueryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskQueryKey })
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(token, id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskQueryKey });
      const previous = queryClient.getQueryData<TaskListResponse>(taskQueryKey);
      queryClient.setQueryData<TaskListResponse>(taskQueryKey, (current) => removeTask(current, id));
      return { previous };
    },
    onError: (_error, _input, context) => queryClient.setQueryData(taskQueryKey, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskQueryKey })
  });

  return (
    <article className="rounded-[22px] border border-white/28 bg-white/34 p-4 shadow-sm dark:border-white/10 dark:bg-white/8">
      <div className="flex items-start gap-3">
        <button
          aria-label={task.status === "COMPLETED" ? "Mark active" : "Mark complete"}
          className={`mt-1 grid size-7 shrink-0 place-items-center rounded-full border transition ${
            task.status === "COMPLETED" ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground/40 text-muted-foreground"
          }`}
          onClick={() => patchMutation.mutate({ id: task.id, patch: { status: task.status === "COMPLETED" ? "ACTIVE" : "COMPLETED" } })}
          type="button"
        >
          {task.status === "COMPLETED" ? <Check aria-hidden="true" className="size-4" /> : null}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`min-w-0 text-base font-semibold ${task.status === "COMPLETED" ? "text-muted-foreground line-through" : ""}`}>{task.title}</h4>
            {task.priority !== "NONE" ? <span className="rounded-full bg-primary/12 px-2 py-1 text-xs font-medium text-primary">{formatPriority(task.priority)}</span> : null}
          </div>
          {task.description ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{task.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.dueDate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/32 px-2 py-1 dark:bg-white/8">
                <CalendarDays aria-hidden="true" className="size-3" />
                {task.dueDate}
              </span>
            ) : null}
            {task.estimatedMinutes ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/32 px-2 py-1 dark:bg-white/8">
                <Clock3 aria-hidden="true" className="size-3" />
                {task.estimatedMinutes}m
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <IconToggle
            active={task.isPinned}
            label={task.isPinned ? "Unpin task" : "Pin task"}
            onClick={() => patchMutation.mutate({ id: task.id, patch: { isPinned: !task.isPinned } })}
          >
            <Pin aria-hidden="true" className="size-4" />
          </IconToggle>
          <IconToggle
            active={task.isFavorite}
            label={task.isFavorite ? "Remove favorite" : "Favorite task"}
            onClick={() => patchMutation.mutate({ id: task.id, patch: { isFavorite: !task.isFavorite } })}
          >
            <Star aria-hidden="true" className="size-4" />
          </IconToggle>
          <button
            aria-label="Delete task"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600"
            onClick={() => deleteMutation.mutate(task.id)}
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function InsightRail({ isConnected, stats }: { isConnected: boolean; stats: TaskListResponse["stats"] }): React.JSX.Element {
  return (
    <aside className="grid gap-4">
      <GlassPanel className="p-5">
        <p className="text-sm text-muted-foreground">Current milestone</p>
        <h3 className="mt-2 text-xl font-semibold">Task CRUD</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isConnected ? "Protected task workflows are connected to the API." : "Connect an account to unlock the protected task API."}
        </p>
      </GlassPanel>
      <GlassPanel className="p-5">
        <p className="text-sm text-muted-foreground">System status</p>
        <div className="mt-4 space-y-3">
          {["Protected API calls", "Optimistic create", "Toggle and delete"].map((item) => (
            <div className="flex items-center justify-between rounded-2xl bg-white/24 px-3 py-2 text-sm dark:bg-white/8" key={item}>
              <span>{item}</span>
              <CheckCircle2 aria-hidden="true" className="size-4 text-accent" />
            </div>
          ))}
        </div>
      </GlassPanel>
      <GlassPanel className="p-5">
        <p className="text-sm text-muted-foreground">Task mix</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <StatPill label="Active" value={stats.active} />
          <StatPill label="Done" value={stats.completed} />
          <StatPill label="Total" value={stats.total} />
          <StatPill label="Minutes" value={stats.focusMinutes} />
        </div>
      </GlassPanel>
    </aside>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }): React.JSX.Element {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        className="h-11 rounded-2xl border border-white/28 bg-white/60 px-4 outline-none transition focus:border-primary dark:border-white/10 dark:bg-white/10"
        {...props}
      />
    </label>
  );
}

function IconToggle({ active, children, label, onClick }: React.PropsWithChildren<{ active: boolean; label: string; onClick: () => void }>): React.JSX.Element {
  return (
    <button
      aria-label={label}
      className={`grid size-9 place-items-center rounded-full transition ${active ? "bg-primary/14 text-primary" : "text-muted-foreground hover:bg-white/34 dark:hover:bg-white/8"}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function EmptyTaskState({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="grid min-h-40 place-items-center rounded-[22px] border border-dashed border-white/38 bg-white/18 p-6 text-center dark:border-white/12 dark:bg-white/6">
      <div>
        <ListTodo aria-hidden="true" className="mx-auto size-7 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }): React.JSX.Element {
  return (
    <div className="rounded-2xl bg-white/24 p-3 dark:bg-white/8">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function readSession(): AuthResponse | null {
  try {
    const value = localStorage.getItem(sessionStorageKey);
    return value ? (JSON.parse(value) as AuthResponse) : null;
  } catch {
    return null;
  }
}

function formatPriority(priority: TaskPriority): string {
  return priority.toLowerCase().replace(/^\w/, (character) => character.toUpperCase());
}

function makeOptimisticTask(input: CreateTaskPayload, priority: TaskPriority): Task {
  const now = new Date().toISOString();
  return {
    completedAt: null,
    createdAt: now,
    description: input.description ?? null,
    dueAt: null,
    dueDate: input.dueDate ?? null,
    estimatedMinutes: input.estimatedMinutes ?? null,
    id: `optimistic-${crypto.randomUUID()}`,
    isFavorite: false,
    isPinned: false,
    priority,
    status: "ACTIVE",
    title: input.title,
    updatedAt: now
  };
}

function addOptimisticTask(current: TaskListResponse | undefined, task: Task): TaskListResponse {
  const next = current ?? emptyTaskResponse;
  return {
    items: [task, ...next.items],
    stats: {
      ...next.stats,
      active: next.stats.active + 1,
      focusMinutes: next.stats.focusMinutes + (task.estimatedMinutes ?? 0),
      total: next.stats.total + 1
    }
  };
}

function patchTask(current: TaskListResponse | undefined, id: string, patch: UpdateTaskPayload): TaskListResponse | undefined {
  if (!current) {
    return current;
  }

  return {
    ...current,
    items: current.items.map((task) =>
      task.id === id
        ? {
            ...task,
            ...patch,
            completedAt: patch.status === "COMPLETED" ? new Date().toISOString() : patch.status === "ACTIVE" ? null : task.completedAt,
            updatedAt: new Date().toISOString()
          }
        : task
    )
  };
}

function removeTask(current: TaskListResponse | undefined, id: string): TaskListResponse | undefined {
  if (!current) {
    return current;
  }

  return {
    ...current,
    items: current.items.filter((task) => task.id !== id)
  };
}

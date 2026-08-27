import type * as React from "react";
import { motion } from "framer-motion";
import { Bell, CalendarDays, CheckCircle2, Inbox, LayoutDashboard, ListTodo, Plus, Search, Sparkles, Star, Zap } from "lucide-react";
import { ThemeToggle } from "../../features/theme/theme.store";
import { Button } from "../../shared/ui/button";
import { GlassPanel } from "../../shared/ui/glass-panel";

const navItems = [
  { label: "Today", icon: CheckCircle2, active: true },
  { label: "Inbox", icon: Inbox },
  { label: "Planning", icon: CalendarDays },
  { label: "Focus", icon: Zap },
  { label: "Favorites", icon: Star }
];

const metrics = [
  { label: "Completed today", value: "0", tone: "from-sky-400 to-indigo-500" },
  { label: "Current streak", value: "0d", tone: "from-teal-300 to-emerald-500" },
  { label: "Focus minutes", value: "0", tone: "from-rose-300 to-orange-400" }
];

export function AppShell(): React.JSX.Element {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackdrop />
      <div className="relative z-10 grid min-h-screen grid-cols-1 gap-4 p-3 md:grid-cols-[260px_1fr] md:p-5">
        <Sidebar />
        <section className="flex min-w-0 flex-col gap-4">
          <TopBar />
          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <TaskCanvas />
            <InsightRail />
          </div>
        </section>
      </div>
      <Button aria-label="Quick add task" className="fixed bottom-5 right-5 z-20 size-14 rounded-full p-0 shadow-glow" type="button">
        <Plus aria-hidden="true" className="size-6" />
      </Button>
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

function Sidebar(): React.JSX.Element {
  return (
    <motion.aside animate={{ opacity: 1, x: 0 }} className="hidden md:block" initial={{ opacity: 0, x: -18 }} transition={{ duration: 0.45, ease: "easeOut" }}>
      <GlassPanel className="flex h-[calc(100vh-40px)] flex-col p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Premium workspace</p>
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
          <p className="mt-1 text-sm text-muted-foreground">Task workflows arrive in Phase 7. The shell is ready for them.</p>
        </div>
      </GlassPanel>
    </motion.aside>
  );
}

function TopBar(): React.JSX.Element {
  return (
    <GlassPanel className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground md:hidden">
          <LayoutDashboard aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Thursday, August 27</p>
          <h2 className="truncate text-2xl font-semibold">Today’s command center</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button aria-label="Search" type="button" variant="icon">
          <Search aria-hidden="true" className="size-4" />
        </Button>
        <Button aria-label="Notifications" type="button" variant="icon">
          <Bell aria-hidden="true" className="size-4" />
        </Button>
        <ThemeToggle />
      </div>
    </GlassPanel>
  );
}

function TaskCanvas(): React.JSX.Element {
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
        <div className="mt-6 rounded-[28px] border border-dashed border-white/40 bg-white/22 p-6 text-center dark:border-white/14 dark:bg-white/6 md:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-glow">
            <ListTodo aria-hidden="true" className="size-7" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold">Your task canvas is ready</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Phase 6 establishes the UI system. In Phase 7, this space becomes the real task list with optimistic CRUD, keyboard-friendly quick add, and protected API calls.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button type="button">
              <Plus aria-hidden="true" className="size-4" />
              Quick add
            </Button>
            <Button type="button" variant="glass">Open planner</Button>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}

function InsightRail(): React.JSX.Element {
  return (
    <aside className="grid gap-4">
      <GlassPanel className="p-5">
        <p className="text-sm text-muted-foreground">Next milestone</p>
        <h3 className="mt-2 text-xl font-semibold">Task CRUD</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">The design system is prepared for list, agenda, and quick-add workflows.</p>
      </GlassPanel>
      <GlassPanel className="p-5">
        <p className="text-sm text-muted-foreground">System status</p>
        <div className="mt-4 space-y-3">
          {['Theme persistence', 'Query provider', 'Motion shell'].map((item) => (
            <div className="flex items-center justify-between rounded-2xl bg-white/24 px-3 py-2 text-sm dark:bg-white/8" key={item}>
              <span>{item}</span>
              <CheckCircle2 aria-hidden="true" className="size-4 text-accent" />
            </div>
          ))}
        </div>
      </GlassPanel>
    </aside>
  );
}


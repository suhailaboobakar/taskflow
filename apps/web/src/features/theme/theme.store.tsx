import type * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Button } from "../../shared/ui/button";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => set({ mode })
    }),
    { name: "taskflow-theme" }
  )
);

export function applyTheme(mode: ThemeMode): void {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", shouldUseDark);
}

const options: Array<{ label: string; mode: ThemeMode; icon: typeof Sun }> = [
  { label: "Light", mode: "light", icon: Sun },
  { label: "Dark", mode: "dark", icon: Moon },
  { label: "System", mode: "system", icon: Monitor }
];

export function ThemeToggle(): React.JSX.Element {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);

  return (
    <div aria-label="Theme" className="inline-flex rounded-full border border-white/25 bg-white/20 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <Button
            aria-label={option.label}
            className={mode === option.mode ? "bg-primary text-primary-foreground" : "bg-transparent"}
            key={option.mode}
            onClick={() => setMode(option.mode)}
            title={option.label}
            type="button"
            variant="icon"
          >
            <Icon aria-hidden="true" className="size-4" />
          </Button>
        );
      })}
    </div>
  );
}


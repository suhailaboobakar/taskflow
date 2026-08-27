import * as React from "react";
import { cn } from "../lib/cn";

export function GlassPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/35 bg-white/48 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
}

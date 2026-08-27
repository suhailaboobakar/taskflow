import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] hover:bg-primary/90",
        glass: "border border-white/30 bg-white/22 text-foreground shadow-glass backdrop-blur-xl hover:bg-white/34 dark:border-white/10 dark:bg-white/10",
        ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
        icon: "size-10 rounded-full border border-white/24 bg-white/18 p-0 backdrop-blur-xl hover:bg-white/28 dark:border-white/10 dark:bg-white/10"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, variant, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant }), className)} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

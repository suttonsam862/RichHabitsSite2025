import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedUnderlineProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedUnderline({ children, className }: AnimatedUnderlineProps) {
  return (
    <span className={cn("relative inline-block", className)}>
      {children}
      <span className="absolute w-3/5 h-[2px] bottom-[-6px] left-0 bg-primary transition-all duration-400 group-hover:w-full"></span>
    </span>
  );
}

"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              "after:animate-aurora pointer-events-none absolute -inset-[10px] opacity-50 blur-[10px] will-change-transform",
              "[background-image:repeating-linear-gradient(100deg,hsl(var(--primary))_10%,hsl(var(--accent))_15%,hsl(var(--primary))_20%,hsl(var(--accent))_25%,hsl(var(--primary))_30%)]",
              "[background-size:300%,_200%] [background-position:50%_50%,50%_50%]",
              "after:absolute after:inset-0 after:[background-image:repeating-linear-gradient(100deg,hsl(var(--accent))_0%,hsl(var(--primary))_50%,hsl(var(--accent))_100%)]",
              "after:[background-size:200%,_100%] after:opacity-30 after:content-['']",
              showRadialGradient && "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

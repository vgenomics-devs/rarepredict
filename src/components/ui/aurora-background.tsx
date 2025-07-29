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
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            "--aurora": "repeating-linear-gradient(100deg, #e2e8f0 0%, #cbd5e1 10%, #94a3b8 20%, #e2e8f0 30%, #cbd5e1 40%, #94a3b8 50%, #e2e8f0 60%, #cbd5e1 70%, #94a3b8 80%, #e2e8f0 90%, #cbd5e1 100%)",
            "--dark-gradient": "repeating-linear-gradient(100deg, #0f172a 0%, #1e293b 10%, #334155 20%, #475569 30%, #64748b 40%, #94a3b8 50%, #cbd5e1 60%, #e2e8f2 70%, #f1f5f9 80%, #f8fafc 90%, #ffffff 100%)",
            "--white-gradient": "repeating-linear-gradient(100deg, #ffffff 0%, #f8fafc 10%, #f1f5f9 20%, #e2e8f0 30%, #cbd5e1 40%, #94a3b8 50%, #64748b 60%, #475569 70%, #334155 80%, #1e293b 90%, #0f172a 100%)",
            
            // Metallic color palette
            "--metal-100": "#f8fafc",
            "--metal-200": "#f1f5f9",
            "--metal-300": "#e2e8f0",
            "--metal-400": "#cbd5e1",
            "--metal-500": "#94a3b8",
            "--metal-600": "#64748b",
            "--metal-700": "#475569",
            "--metal-800": "#334155",
            "--metal-900": "#1e293b",
            "--metal-950": "#0f172a",
            
            // Other colors
            "--black": "#000",
            "--white": "#fff",
            "--transparent": "transparent",
          } as React.CSSProperties}
        >
          <div
            //   I'm sorry but this is what peak developer performance looks like // trigger warning
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-80 blur-[8px] contrast-125 brightness-110 saturate-150 will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--metal-300)_10%,var(--metal-400)_15%,var(--metal-500)_20%,var(--metal-400)_25%,var(--metal-300)_30%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:mix-blend-overlay after:opacity-70 after:content-['']`,
              showRadialGradient && `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
              "metallic-shine"
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};

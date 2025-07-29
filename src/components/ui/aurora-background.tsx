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
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-slate-900 text-white overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* Animated flowing aurora effect */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              background: `
                linear-gradient(90deg, 
                  transparent 0%, 
                  hsl(var(--accent) / 0.3) 20%, 
                  hsl(var(--primary) / 0.4) 40%, 
                  transparent 60%, 
                  hsl(var(--accent) / 0.2) 80%, 
                  transparent 100%
                )
              `,
              transform: 'skewY(-12deg)',
              animation: 'aurora-flow 8s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `
                linear-gradient(120deg, 
                  transparent 0%, 
                  hsl(var(--primary) / 0.2) 30%, 
                  hsl(var(--accent) / 0.3) 50%, 
                  transparent 70%
                )
              `,
              transform: 'skewY(8deg)',
              animation: 'aurora-flow-reverse 10s ease-in-out infinite'
            }}
          />
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 200% 100% at 50% 0%, 
                  hsl(var(--accent) / 0.4) 0%, 
                  transparent 50%
                ),
                radial-gradient(ellipse 150% 80% at 80% 50%, 
                  hsl(var(--primary) / 0.3) 0%, 
                  transparent 50%
                )
              `,
              animation: 'aurora-glow 6s ease-in-out infinite alternate'
            }}
          />
        </div>
        
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {children}
      </div>
    </main>
  );
};

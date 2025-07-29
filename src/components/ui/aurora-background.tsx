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
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-slate-900/40" />
        
        {/* Animated aurora layers */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/25 to-cyan-500/25 rounded-full blur-3xl animate-pulse animation-delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>
        
        {/* Moving aurora effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, hsl(var(--accent) / 0.3) 0%, transparent 60%),
              radial-gradient(ellipse 60% 70% at 70% 30%, hsl(var(--primary) / 0.2) 0%, transparent 60%),
              radial-gradient(ellipse 90% 40% at 40% 70%, hsl(var(--accent) / 0.15) 0%, transparent 60%)
            `,
            animation: 'aurora 8s ease-in-out infinite alternate'
          }}
        />
        
        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 150px 150px'
          }}
        />
        
        {children}
      </div>
    </main>
  );
};

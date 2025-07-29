"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { ReactNode, useEffect, useRef, useMemo } from "react";

// Medical icons removed as per user request

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
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      targetPosition.current = { x, y };
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    const animate = () => {
      // Smoothly interpolate current position towards target position
      currentPosition.current.x += (targetPosition.current.x - currentPosition.current.x) * 0.05;
      currentPosition.current.y += (targetPosition.current.y - currentPosition.current.y) * 0.05;

      // Apply the position to CSS variables
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${currentPosition.current.x}%`);
        containerRef.current.style.setProperty('--mouse-y', `${currentPosition.current.y}%`);
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  // Floating icons removed as per user request

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden bg-slate-900 text-white",
        className
      )}
      {...props}
    >

      {/* Moving gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Animated gradient layers */}
        <div 
          className="absolute -inset-16 opacity-60"
          style={{
            background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.5) 0%, rgba(168, 85, 247, 0.5) 50%, transparent 100%)',
            animation: 'moveGradient1 15s ease infinite',
            transform: 'rotate(0deg)',
            willChange: 'transform',
          }}
        />
        
        <div 
          className="absolute -inset-20 opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%)',
            animation: 'moveGradient2 20s ease infinite',
            transform: 'rotate(0deg)',
            willChange: 'transform',
          }}
        />
        
        <div 
          className="absolute -inset-24 opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
            animation: 'moveGradient3 25s ease infinite',
            willChange: 'transform, opacity',
          }}
        />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-4">
        {children}
      </div>

      {/* Global styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes moveGradient1 {
            0%, 100% {
              transform: translate(-20%, -20%) scale(1.5) rotate(0deg);
            }
            50% {
              transform: translate(20%, 20%) scale(1.8) rotate(180deg);
            }
          }
          
          @keyframes moveGradient2 {
            0%, 100% {
              transform: translate(15%, -15%) scale(1.6) rotate(45deg);
            }
            50% {
              transform: translate(-15%, 15%) scale(1.9) rotate(225deg);
            }
          }
          
          @keyframes moveGradient3 {
            0%, 100% {
              transform: scale(1);
              opacity: 0.3;
            }
            50% {
              transform: scale(1.5);
              opacity: 0.5;
            }
          }
          

        `
      }} />
    </div>
  );
};

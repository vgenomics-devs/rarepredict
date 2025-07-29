"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

export const SparklesCore: React.FC<SparklesCoreProps> = ({
  id = "sparkles",
  background = "transparent",
  minSize = 0.5,
  maxSize = 1.5,
  particleDensity = 100,
  className,
  particleColor = "#FFFFFF",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
  }>>([]);

  // Initialize canvas and particles
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const updateDimensions = () => {
      if (canvas.parentElement) {
        const { width, height } = canvas.parentElement.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setDimensions({ width, height });
      }
    };

    // Create particles
    const createParticles = () => {
      const newParticles = [];
      const particleCount = Math.floor((particleDensity * dimensions.width * dimensions.height) / 10000);
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      
      setParticles(newParticles);
    };

    // Animation loop
    let animationId: number;
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update and draw particles
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          // Update position
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Bounce off edges
          if (newX < 0 || newX > dimensions.width) {
            particle.speedX *= -1;
            newX = Math.max(0, Math.min(newX, dimensions.width));
          }
          if (newY < 0 || newY > dimensions.height) {
            particle.speedY *= -1;
            newY = Math.max(0, Math.min(newY, dimensions.height));
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `${particleColor}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
          
          return {
            ...particle,
            x: newX,
            y: newY,
          };
        })
      );
      
      animationId = requestAnimationFrame(animate);
    };

    // Handle resize
    const handleResize = () => {
      updateDimensions();
      createParticles();
    };

    // Initialize
    updateDimensions();
    createParticles();
    animationId = requestAnimationFrame(animate);
    
    // Add event listeners
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, maxSize, minSize, particleDensity, particleColor]);

  return (
    <div 
      className={cn("absolute inset-0 w-full h-full", className)}
      style={{ background }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

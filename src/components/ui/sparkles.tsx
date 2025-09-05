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
  // Use ref to store particles for animation loop
  const particlesRef = useRef<Array<{
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
        // Only update if dimensions actually changed
        if (width !== dimensions.width || height !== dimensions.height) {
          canvas.width = width;
          canvas.height = height;
          setDimensions({ width, height });
          return { width, height };
        }
      }
      return { width: canvas.width, height: canvas.height };
    };

    // Initial setup
    const { width, height } = updateDimensions();
    
    // Create initial particles
    const initialParticles = [];
    const particleCount = Math.floor((particleDensity * width * height) / 10000);
    
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }
    
    // Animation loop using requestAnimationFrame
    let animationId: number;
    let lastTime = 0;
    
    // Initialize particles ref
    particlesRef.current = initialParticles;
    
    const animate = (currentTime: number) => {
      if (!ctx) return;
      
      // Calculate delta time for smooth animation
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Throttle updates for better performance
      if (deltaTime < 16) { // ~60fps
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const { width: currentWidth, height: currentHeight } = updateDimensions();
      
      // Clear canvas
      ctx.clearRect(0, 0, currentWidth, currentHeight);
      
      // Update and draw particles
      const updatedParticles = particlesRef.current.map(particle => {
        // Create a new particle object to avoid mutating the original
        const updatedParticle = { ...particle };
        
        // Update position with delta time for smooth animation
        updatedParticle.x += updatedParticle.speedX * (deltaTime / 16);
        updatedParticle.y += updatedParticle.speedY * (deltaTime / 16);
        
        // Bounce off edges with damping
        if (updatedParticle.x < 0 || updatedParticle.x > currentWidth) {
          updatedParticle.speedX *= -0.9;
          updatedParticle.x = Math.max(0, Math.min(updatedParticle.x, currentWidth));
        }
        if (updatedParticle.y < 0 || updatedParticle.y > currentHeight) {
          updatedParticle.speedY *= -0.9;
          updatedParticle.y = Math.max(0, Math.min(updatedParticle.y, currentHeight));
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(updatedParticle.x, updatedParticle.y, updatedParticle.size, 0, Math.PI * 2);
        
        // Set fill style with opacity
        const opacityHex = Math.floor(updatedParticle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = `${particleColor}${opacityHex}`;
        ctx.fill();
        
        return updatedParticle;
      });
      
      // Update the particles ref for the next frame
      particlesRef.current = updatedParticles;
      
      // Continue animation loop
      animationId = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationId = requestAnimationFrame(animate);
    
    // Clean up animation frame on unmount
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [dimensions, maxSize, minSize, particleDensity, particleColor]); // Removed particles from dependencies

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

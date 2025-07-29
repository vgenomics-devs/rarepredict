"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const currentWord = words[currentIndex];

  useEffect(() => {
    // Start the animation sequence
    const timer = setTimeout(() => {
      setIsVisible(false);
      
      // After fade out, change the word and fade in
      const changeWord = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsVisible(true);
      }, 300); // Wait for fade out to complete

      return () => clearTimeout(changeWord);
    }, duration - 300); // Start fade out slightly before the word change

    return () => clearTimeout(timer);
  }, [currentIndex, duration, words.length]);

  return (
    <div className="inline-block relative min-h-[1.5em]">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.span
            key={currentWord}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeInOut" 
            }}
            className={cn("inline-block w-full text-left", className)}
          >
            {currentWord}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

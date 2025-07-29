"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { AuroraBackground } from "./ui/aurora-background";
import { FlipWords } from "./flipwords";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryButtonText,
  primaryButtonHref = "#",
  secondaryButtonText,
  secondaryButtonHref = "#",
}: HeroSectionProps) {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative w-full max-w-6xl mx-auto px-4 py-20 md:py-32 text-center"
      >
        <h1 className="font-jakarta text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="block mb-4 text-foreground/90">{title}</span>
          <span className="relative inline-block">
            <FlipWords 
              words={subtitle.split(', ')}
              className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
              duration={3000}
            />
          </span>
        </h1>
        {/* <p className="text-lg md:text-xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed mt-6">
          {description}
        </p> */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* <Button 
            asChild
            size="lg" 
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <a href={primaryButtonHref}>
              {primaryButtonText}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          </Button> */}
          {secondaryButtonText && (
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-2 border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5 transition-colors duration-300"
            >
              {/* <a href={secondaryButtonHref}>
                {secondaryButtonText}
              </a> */}
            </Button>
          )}
        </div>
      </motion.div>
    </AuroraBackground>
  );
}

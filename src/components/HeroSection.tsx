"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { AuroraBackground } from "./ui/aurora-background";
import { FlipWords } from "./flipwords";
import { useNavigate } from "react-router-dom";
import NavBar from '@/components/NavBar'
import logo from "../assets/logo.png";

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
  const navigate = useNavigate();

  const scrollToPrediction = () => {
    const element = document.getElementById('prediction-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#prediction-section');
    }
  };

  return (
    <AuroraBackground backgroundImage="/Group-228-2-scaled.jpg">
      <NavBar />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative w-full max-w-6xl mx-auto px-4 py-10 md:py-28 text-center"
      >
        <div className="font-sans">
          <h1 className="text-4xl md:text-5xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 to-neutral-600 dark:from-neutral-200 dark:to-neutral-400">
            <span className="block mb-4 text-white  font-sans">Your health journey starts with</span>
            <span className="relative inline-block">
              <div className="inline-block">
                <FlipWords
                  words={['understanding', 'clarity', 'precision', 'empowerment']}
                  className="font-bold text-white dark:text-white font- md:text-5xl"
                  duration={3000}
                />
              </div>
            </span>
          </h1>
        </div>
        {/* <div className="flex flex-col items-center mt-6 space-y-2">
          <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 font-medium">Powered by</p>
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="VGenomics"
              className="h-24 w-48 object-contain"
            />
          </div>
        </div> */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={scrollToPrediction}
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-black"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          {secondaryButtonText && (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-2 border-black/30 dark:border-white/30 hover:border-black/50 dark:hover:border-white/50 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 text-black dark:text-white"
            >
              {secondaryButtonText}
            </Button>
          )}
        </div>
      </motion.div>
    </AuroraBackground>
  );
}

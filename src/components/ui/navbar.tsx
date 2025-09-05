"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";


export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        // At the very top: keep navbar visible
        setVisible(true);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-white/10 rounded-2xl bg-black/20 backdrop-blur-xl shadow-2xl z-[5000] px-6 py-4 items-center justify-center space-x-6",
          className
        )}
      >
        {navItems.map((navItem: { name: string; link: string; icon?: JSX.Element }, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            onClick={(e) => {
              if (typeof navItem.link === 'string' && navItem.link.startsWith('#')) {
                e.preventDefault();
                const id = navItem.link.slice(1);
                if (!id) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                const el = document.getElementById(id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            }}
            className={cn(
              "relative text-white/90 hover:text-white items-center flex space-x-2 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
            )}
          >
            <span className="block sm:hidden text-lg">{navItem.icon}</span>
            <span className="hidden sm:block text-base">{navItem.name}</span>
          </a>
        ))}
        <button className="border text-base font-semibold relative border-white/20 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm">
          <span>Login</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-white/50 to-transparent h-px" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

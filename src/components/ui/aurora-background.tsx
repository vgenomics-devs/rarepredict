"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  backgroundImage?: string; // new prop for background image
}

export const AuroraBackground = ({
  className,
  children,
  backgroundImage,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden font-sans",
        className
      )}
      style={{
        backgroundColor: "#E3CDC1",
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      {...props}
    >
      {/* Foreground Content */}
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>
  );
};

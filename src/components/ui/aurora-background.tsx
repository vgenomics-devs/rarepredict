"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

export const AuroraBackground = ({
  className,
  children,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-[#E3CDC1]",
        className
      )}
      {...props}
    >
      {/* Foreground Content */}
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>
  );
};

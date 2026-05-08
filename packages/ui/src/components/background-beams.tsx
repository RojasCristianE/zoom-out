"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@ui/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "absolute inset-0 z-0 h-full w-full overflow-hidden mask-[radial-gradient(ellipse_at_center,white,transparent)]",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        fill="none"
        className="absolute inset-0 h-full w-full opacity-40"
      >
        <g filter="url(#filter0_f)">
          <path
            d="M-200 450C-200 650 450 900 720 900C990 900 1640 650 1640 450C1640 250 990 0 720 0C450 0 -200 250 -200 450Z"
            fill="url(#paint0_radial)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f"
            x="-600"
            y="-400"
            width="2640"
            height="1700"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="200" result="effect1_foregroundBlur" />
          </filter>
          <radialGradient
            id="paint0_radial"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(720 450) rotate(90) scale(450 720)"
          >
            <stop stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="1" stopColor="var(--background)" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      <BeamsCore />
    </div>
  );
};

const BeamsCore = () => {
  return (
    <div className="absolute inset-0 z-0 h-full w-full opacity-30">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent animate-pulse" />
      <div className="absolute top-0 left-1/4 h-full w-px bg-linear-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 right-1/4 h-full w-px bg-linear-to-b from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

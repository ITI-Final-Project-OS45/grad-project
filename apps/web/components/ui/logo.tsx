"use client";

import React from "react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  alt?: string;
}

export const Logo = ({
  width = 120,
  height = 40,
  className = "",
  alt = "Logo",
}: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`${className}`}
        style={{ width, height }}
        aria-label={alt}
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const logoSrc = isDark ? "/assets/logo-dark.svg" : "/assets/logo-light.svg";

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

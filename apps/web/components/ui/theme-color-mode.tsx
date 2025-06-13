"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

// ! Only for MD editor.
export function ThemeColorMode() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const html = document.documentElement;
    if (resolvedTheme) {
      html.setAttribute("data-color-mode", resolvedTheme);
    }
  }, [resolvedTheme]);

  return null;
}

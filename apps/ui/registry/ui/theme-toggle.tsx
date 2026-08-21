"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

function ThemeToggle({
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "children">) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Button
      data-slot="theme-toggle"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      {...props}
    >
      {mounted && resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}

export { ThemeToggle };

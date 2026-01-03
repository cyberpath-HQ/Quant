/**
 * Header Component
 *
 * Application header with logo, navigation, and theme toggle
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <img src="/src/assets/logo.svg" alt="Quant" className="h-8 w-auto dark:hidden" />
            <img src="/src/assets/logo-white.svg" alt="Quant" className="h-8 w-auto hidden dark:block" />
          </a>
          <nav className="hidden md:flex gap-6">
            <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Calculator
            </a>
            <a href="/docs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Documentation
            </a>
            <a
              href="https://github.com/cyberpath-HQ/Quant"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              GitHub
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

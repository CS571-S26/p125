"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const CYCLE: Record<string, string> = {
  system: "light",
  light: "dark",
  dark: "system",
}

const LABELS: Record<string, string> = {
  system: "System theme",
  light: "Light mode",
  dark: "Dark mode",
}

export function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme()

  function cycleTheme() {
    setTheme(CYCLE[theme] ?? "system")
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={cycleTheme} aria-label="Toggle theme">
          <Sun className="h-4 w-4 scale-100 dark:scale-0 transition-transform duration-200" />
          <Moon className="absolute h-4 w-4 scale-0 dark:scale-100 transition-transform duration-200" />
          <span className="sr-only">{LABELS[theme]}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{LABELS[theme] ?? "Toggle theme"}</TooltipContent>
    </Tooltip>
  )
}

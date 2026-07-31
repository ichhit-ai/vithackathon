import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`focus-brass group relative flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline text-brass transition-colors duration-300 hover:bg-brass/10 ${className}`}
    >
      <Sun
        size={16}
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: `rotate(${isDark ? -90 : 0}deg) scale(${isDark ? 0.6 : 1})`,
        }}
      />
      <Moon
        size={16}
        className="absolute transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: `rotate(${isDark ? 0 : 90}deg) scale(${isDark ? 1 : 0.6})`,
        }}
      />
    </button>
  );
}

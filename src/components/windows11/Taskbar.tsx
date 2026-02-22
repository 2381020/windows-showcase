import { useState, useEffect } from "react";
import { Sun, Moon, Wifi, Volume2 } from "lucide-react";
import { desktopApps, type AppId } from "@/data/portfolio";
import type { WindowState } from "@/hooks/useWindowManager";

interface TaskbarProps {
  windows: WindowState[];
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleStartMenu: () => void;
  onOpenApp: (id: AppId) => void;
  startMenuOpen: boolean;
}

const Taskbar = ({
  windows,
  isDark,
  onToggleTheme,
  onToggleStartMenu,
  onOpenApp,
}: TaskbarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-win-taskbar/90 win-acrylic border-t border-border z-[60] flex items-center px-2">
      {/* Center: Start + app icons */}
      <div className="flex-1 flex items-center justify-center gap-0.5">
        {/* Start button */}
        <button
          className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors"
          onClick={onToggleStartMenu}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
            <rect x="11" y="1" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
            <rect x="1" y="11" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
            <rect x="11" y="11" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
          </svg>
        </button>

        {/* App shortcuts */}
        {desktopApps.map((app) => {
          const isOpen = windows.some((w) => w.id === app.id && !w.minimized);
          const exists = windows.some((w) => w.id === app.id);
          return (
            <button
              key={app.id}
              className={`h-10 w-10 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors relative ${
                isOpen ? "bg-win-hover" : ""
              }`}
              onClick={() => onOpenApp(app.id)}
              title={app.name}
            >
              <span className="text-lg">{app.icon}</span>
              {exists && (
                <div
                  className={`absolute bottom-0.5 h-0.5 rounded-full bg-primary transition-all ${
                    isOpen ? "w-4" : "w-1.5"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* System tray */}
      <div className="flex items-center gap-1">
        <button
          className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors"
          onClick={onToggleTheme}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-win-taskbar-foreground" />
          ) : (
            <Moon className="h-4 w-4 text-win-taskbar-foreground" />
          )}
        </button>
        <div className="flex items-center gap-1.5 px-2">
          <Wifi className="h-3.5 w-3.5 text-win-taskbar-foreground opacity-70" />
          <Volume2 className="h-3.5 w-3.5 text-win-taskbar-foreground opacity-70" />
        </div>
        <button className="h-10 px-3 rounded-md hover:bg-win-hover transition-colors text-right">
          <div className="text-[11px] leading-tight text-win-taskbar-foreground">
            {formatTime(time)}
          </div>
          <div className="text-[11px] leading-tight text-win-taskbar-foreground opacity-70">
            {formatDate(time)}
          </div>
        </button>
      </div>
    </div>
  );
};

export default Taskbar;

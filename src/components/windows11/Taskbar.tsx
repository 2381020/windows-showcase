import { useState, useEffect, useMemo, useRef } from "react";
import { Sun, Moon, Wifi, Volume2, Search, ChevronUp } from "lucide-react";
import { desktopApps, type AppId } from "@/data/portfolio";
import type { WindowState } from "@/hooks/useWindowManager";

interface TaskbarProps {
  windows: WindowState[];
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleStartMenu: () => void;
  onOpenApp: (id: AppId) => void;
  onToggleApp: (id: AppId) => void;
  startMenuOpen: boolean;
}

const Taskbar = ({
  windows,
  isDark,
  onToggleTheme,
  onToggleStartMenu,
  onOpenApp,
  onToggleApp,
  startMenuOpen,
}: TaskbarProps) => {
  const [time, setTime] = useState(new Date());
  const [taskSearch, setTaskSearch] = useState("");
  const [trayOpen, setTrayOpen] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const searchResults = useMemo(
    () =>
      taskSearch.trim()
        ? desktopApps.filter((app) =>
            app.name.toLowerCase().includes(taskSearch.trim().toLowerCase())
          )
        : [],
    [taskSearch]
  );

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!trayRef.current) return;
      if (!trayRef.current.contains(e.target as Node)) {
        setTrayOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-12 bg-win-taskbar/90 win-acrylic border-t border-border z-[60] flex items-center px-2">
      {/* Center: Start + app icons */}
      <div className="flex-1 flex items-center justify-center gap-1.5 relative">
        {/* Start button */}
        <button
          className={`h-10 w-10 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors ${
            startMenuOpen ? "bg-win-hover" : ""
          }`}
          onClick={onToggleStartMenu}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
            <rect x="11" y="1" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
            <rect x="1" y="11" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
            <rect x="11" y="11" width="8" height="8" rx="1" fill="hsl(var(--primary))" />
          </svg>
        </button>

        {/* Search bar (right side of Start icon) */}
        <div className="relative">
          <div className="h-9 w-64 rounded-full border border-border/80 bg-secondary/70 flex items-center gap-2 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={taskSearch}
              placeholder="Search apps"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              onChange={(e) => setTaskSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchResults[0]) {
                  onOpenApp(searchResults[0].id);
                  setTaskSearch("");
                }
              }}
            />
          </div>
          {searchResults.length > 0 && (
            <div className="absolute bottom-11 left-0 w-64 rounded-lg border border-border bg-card/95 win-acrylic win-shadow p-1">
              {searchResults.slice(0, 5).map((app) => (
                <button
                  key={app.id}
                  className="w-full rounded-md px-2 py-1.5 flex items-center gap-2 hover:bg-win-hover text-left"
                  onClick={() => {
                    onOpenApp(app.id);
                    setTaskSearch("");
                  }}
                >
                  <span className="text-base">{app.icon}</span>
                  <span className="text-xs text-foreground">{app.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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
              onClick={() => onToggleApp(app.id)}
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
      <div className="flex items-center gap-1 relative" ref={trayRef}>
        <button
          className={`h-9 w-7 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors ${
            trayOpen ? "bg-win-hover" : ""
          }`}
          onClick={() => setTrayOpen((v) => !v)}
          title="Hidden icons"
          aria-expanded={trayOpen}
        >
          <ChevronUp
            className={`h-3.5 w-3.5 text-win-taskbar-foreground transition-transform duration-200 ease-out ${
              trayOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
        {trayOpen && (
          <div className="absolute bottom-11 right-20 w-44 rounded-lg border border-border bg-win-start-menu/95 win-acrylic win-shadow p-1.5">
            <button
              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-win-hover transition-colors text-left"
              onClick={() => {
                onToggleTheme();
                setTrayOpen(false);
              }}
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-foreground" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )}
              <span className="text-xs text-foreground">
                {isDark ? "Switch to Light mode" : "Switch to Dark mode"}
              </span>
            </button>
          </div>
        )}
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

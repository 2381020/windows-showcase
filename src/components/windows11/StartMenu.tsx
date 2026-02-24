import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { desktopApps, type AppId } from "@/data/portfolio";
import { Search, Power, X, ChevronRight, FileText, Image as ImageIcon } from "lucide-react";
import { portfolioData } from "@/data/portfolio";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
}

const StartMenu = ({ isOpen, onClose, onOpenApp }: StartMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [activeAppIndex, setActiveAppIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const appButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const recommendedItems = [
    { id: "rec-1", title: "About_Profile.pdf", time: "5h ago", icon: "pdf" },
    { id: "rec-2", title: "Projects_Overview.png", time: "6h ago", icon: "img" },
    { id: "rec-3", title: "Skills_Summary.pdf", time: "Yesterday", icon: "pdf" },
    { id: "rec-4", title: "Contact_Notes.png", time: "Yesterday", icon: "img" },
  ] as const;

  const filteredApps = searchQuery.trim()
    ? desktopApps.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;
  const visibleApps = useMemo(() => filteredApps ?? desktopApps, [filteredApps]);
  const columns = 6;

  const openAppAtIndex = useCallback(
    (index: number) => {
      const app = visibleApps[index];
      if (!app) return;
      onOpenApp(app.id);
      onClose();
    },
    [visibleApps, onOpenApp, onClose]
  );

  // Reset search when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveAppIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = window.requestAnimationFrame(() => {
        setIsVisible(true);
        searchInputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(raf);
    }

    setIsVisible(false);
    const timeout = window.setTimeout(() => setShouldRender(false), 220);
    return () => window.clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!visibleApps.length) {
      setActiveAppIndex(0);
      return;
    }
    if (activeAppIndex > visibleApps.length - 1) {
      setActiveAppIndex(visibleApps.length - 1);
    }
  }, [activeAppIndex, visibleApps.length]);

  const handleKeyboardNavigation = useCallback(
    (e: React.KeyboardEvent) => {
      if (!visibleApps.length) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setActiveAppIndex((prev) => Math.min(visibleApps.length - 1, prev + 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setActiveAppIndex((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveAppIndex((prev) => Math.min(visibleApps.length - 1, prev + columns));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveAppIndex((prev) => Math.max(0, prev - columns));
          break;
        case "Home":
          e.preventDefault();
          setActiveAppIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveAppIndex(visibleApps.length - 1);
          break;
        case "Enter":
          if (document.activeElement === searchInputRef.current && searchQuery.trim()) {
            e.preventDefault();
            openAppAtIndex(activeAppIndex);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [activeAppIndex, columns, onClose, openAppAtIndex, searchQuery, visibleApps.length]
  );

  useEffect(() => {
    const target = appButtonRefs.current[activeAppIndex];
    if (target) {
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, [activeAppIndex]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[69] transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`fixed bottom-14 left-1/2 -translate-x-1/2 w-[720px] max-w-[calc(100vw-2rem)] rounded-xl bg-win-start-menu/95 win-acrylic win-shadow border border-border z-[70] overflow-hidden transition-all duration-220 ease-out ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]"
        }`}
        onKeyDown={handleKeyboardNavigation}
      >
        {/* Search */}
        <div className="p-6 pb-3">
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5 bg-secondary/80 border border-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              placeholder="Search for apps, settings, and documents"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && visibleApps[activeAppIndex]) {
                  e.preventDefault();
                  openAppAtIndex(activeAppIndex);
                }
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned / Search results */}
        <div className="px-10 py-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[28px] font-semibold text-foreground">
              {filteredApps ? "Search Results" : "Pinned"}
            </span>
            {!filteredApps && (
              <button className="h-8 px-3 rounded-md bg-secondary hover:bg-win-hover text-foreground text-sm inline-flex items-center gap-1.5">
                All
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {visibleApps.length > 0 ? (
            <div className="grid grid-cols-6 gap-1">
              {visibleApps.map((app, index) => (
                <button
                  key={app.id}
                  ref={(el) => {
                    appButtonRefs.current[index] = el;
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-md transition-colors ${
                    activeAppIndex === index
                      ? "bg-primary/20 ring-1 ring-primary/70"
                      : "hover:bg-win-hover"
                  }`}
                  onMouseEnter={() => setActiveAppIndex(index)}
                  onFocus={() => setActiveAppIndex(index)}
                  onClick={() => {
                    onOpenApp(app.id);
                    onClose();
                  }}
                >
                  <span className="text-2xl mb-1">{app.icon}</span>
                  <span className="text-[11px] text-foreground text-center leading-tight">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No apps found</p>
          )}
        </div>

        {/* Recommended section */}
        {!filteredApps && (
          <div className="px-10 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[28px] font-semibold text-foreground">Recommended</span>
              <button className="h-8 px-3 rounded-md bg-secondary hover:bg-win-hover text-foreground text-sm inline-flex items-center gap-1.5">
                More
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {recommendedItems.map((item) => (
                <button
                  key={item.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-win-hover text-left"
                >
                  <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                    {item.icon === "pdf" ? (
                      <FileText className="h-4 w-4 text-foreground" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-foreground truncate">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User footer */}
        <div className="border-t border-border mt-2 px-6 py-3 bg-secondary/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm text-foreground font-semibold">
                  {portfolioData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground">{portfolioData.name}</span>
            </div>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors">
              <Power className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartMenu;

import { useState, useRef, useCallback, useEffect, type TouchEvent } from "react";
import { desktopApps, type AppId } from "@/data/portfolio";
import { Search, Phone, MessageSquare, Chrome, Camera } from "lucide-react";

const ClockWidget = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-4 mt-6 rounded-3xl bg-[hsl(0,0%,0%,0.3)] backdrop-blur-xl p-6 flex flex-col items-center gap-1">
      <span className="text-5xl font-thin text-[hsl(0,0%,100%)] tracking-wider">{timeStr}</span>
      <span className="text-sm text-[hsl(0,0%,100%,0.7)] mt-1">{dateStr}</span>
    </div>
  );
};

interface AndroidHomeScreenProps {
  onOpenApp: (id: AppId) => void;
}

// Split apps into pages of 8 (4x2 grid per page)
const APPS_PER_PAGE = 8;

const pages = (() => {
  const result: (typeof desktopApps)[] = [];
  for (let i = 0; i < desktopApps.length; i += APPS_PER_PAGE) {
    result.push(desktopApps.slice(i, i + APPS_PER_PAGE));
  }
  // Always at least 2 pages for swipe feel (second page can be empty with a widget-like area)
  if (result.length < 2) result.push([]);
  return result;
})();

const AndroidHomeScreen = ({ onOpenApp }: AndroidHomeScreenProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    // Clamp: don't let swipe beyond first/last page
    const maxOffset = (pages.length - 1) * window.innerWidth;
    const raw = -currentPage * window.innerWidth + dx;
    const clamped = Math.max(-maxOffset, Math.min(0, raw));
    setTranslateX(clamped);
  }, [currentPage]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current) return;
    const elapsed = Date.now() - touchStart.current.time;
    const threshold = window.innerWidth * 0.25;
    const currentOffset = translateX + currentPage * window.innerWidth;

    let newPage = currentPage;
    // Fast swipe or far enough drag
    if (Math.abs(currentOffset) > threshold || (elapsed < 300 && Math.abs(currentOffset) > 30)) {
      if (currentOffset < 0 && currentPage < pages.length - 1) {
        newPage = currentPage + 1;
      } else if (currentOffset > 0 && currentPage > 0) {
        newPage = currentPage - 1;
      }
    }

    setCurrentPage(newPage);
    setTranslateX(-newPage * window.innerWidth);
    setIsSwiping(false);
    touchStart.current = null;
  }, [translateX, currentPage]);

  // Compute final transform
  const finalTranslate = isSwiping ? translateX : -currentPage * window.innerWidth;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search bar */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 bg-[hsl(0,0%,100%,0.15)] rounded-full px-4 py-2.5 win-acrylic">
          <Search className="h-4 w-4 text-[hsl(0,0%,100%,0.7)]" />
          <span className="text-sm text-[hsl(0,0%,100%,0.5)]">Search apps...</span>
        </div>
      </div>

      {/* Swipeable pages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(${finalTranslate}px)`,
            transition: isSwiping ? "none" : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {pages.map((pageApps, pageIndex) => (
            <div
              key={pageIndex}
              className="min-w-full px-4 pt-4"
            >
              {pageApps.length > 0 ? (
                <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                  {pageApps.map((app) => (
                    <button
                      key={app.id}
                      className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150"
                      onClick={() => onOpenApp(app.id)}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-[hsl(0,0%,100%,0.15)] win-acrylic flex items-center justify-center shadow-lg">
                        <span className="text-2xl">{app.icon}</span>
                      </div>
                      <span className="text-[11px] text-[hsl(0,0%,100%)] text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                        {app.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <ClockWidget />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Page dots */}
      <div className="flex items-center justify-center gap-1.5 pb-2">
        {pages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentPage ? "w-4 bg-[hsl(0,0%,100%,0.9)]" : "w-1.5 bg-[hsl(0,0%,100%,0.4)]"
            }`}
          />
        ))}
      </div>

      {/* Dock bar */}
      <div className="mx-4 mb-3 rounded-3xl bg-[hsl(0,0%,100%,0.15)] backdrop-blur-xl px-6 py-3 flex items-center justify-around">
        {[
          { icon: <Phone className="h-6 w-6" />, label: "Phone" },
          { icon: <MessageSquare className="h-6 w-6" />, label: "Messages" },
          { icon: <Chrome className="h-6 w-6" />, label: "Chrome" },
          { icon: <Camera className="h-6 w-6" />, label: "Camera" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
          >
            <div className="h-12 w-12 rounded-2xl bg-[hsl(0,0%,100%,0.18)] flex items-center justify-center text-[hsl(0,0%,100%)]">
              {item.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AndroidHomeScreen;

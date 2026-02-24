import { useState, useRef, useCallback, useEffect, useMemo, type TouchEvent } from "react";
import { desktopApps, type AppId } from "@/data/portfolio";
import { getWallpaperGradient } from "@/components/windows11/DesktopContextMenu";
import {
  Search,
  Phone,
  MessageSquare,
  Camera,
  Settings,
  X,
  LayoutGrid,
  RefreshCw,
  Image,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";

interface PicsumPhoto {
  id: string;
  author: string;
  download_url: string;
}

const ClockWidget = () => {
  const [now, setNow] = useState(new Date());
  const [photos, setPhotos] = useState<PicsumPhoto[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadPhotos = async () => {
      try {
        setIsLoadingPhoto(true);
        const res = await fetch("https://picsum.photos/v2/list?page=2&limit=12", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load photos");
        const data = (await res.json()) as PicsumPhoto[];
        const valid = data.filter((item) => item.download_url);
        setPhotos(valid);
      } catch {
        setPhotos([]);
      } finally {
        setIsLoadingPhoto(false);
      }
    };
    void loadPhotos();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [photos]);

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const currentPhoto = photos[photoIndex];
  const photoUrl = currentPhoto
    ? `https://picsum.photos/id/${currentPhoto.id}/640/360`
    : null;

  return (
    <div className="mx-4 mt-6 rounded-3xl bg-[hsl(0,0%,0%,0.3)] backdrop-blur-xl p-6 flex flex-col items-center gap-1">
      <span className="text-5xl font-thin text-[hsl(0,0%,100%)] tracking-wider">{timeStr}</span>
      <span className="text-sm text-[hsl(0,0%,100%,0.7)] mt-1">{dateStr}</span>
      <div className="mt-4 w-full overflow-hidden rounded-2xl bg-[hsl(0,0%,100%,0.12)]">
        {photoUrl ? (
          <img
            key={currentPhoto.id}
            src={photoUrl}
            alt={`Photo by ${currentPhoto.author}`}
            className="h-40 w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-40 w-full flex items-center justify-center text-xs text-[hsl(0,0%,100%,0.75)]">
            {isLoadingPhoto ? "Memuat foto..." : "Foto tidak tersedia"}
          </div>
        )}
        <div className="px-3 py-2 text-[11px] text-[hsl(0,0%,100%,0.75)] truncate">
          {currentPhoto ? `Photo by ${currentPhoto.author}` : "Wallpaper feed"}
        </div>
      </div>
    </div>
  );
};

interface AndroidHomeScreenProps {
  onOpenApp: (id: AppId) => void;
  wallpaperIndex: number;
  onChangeWallpaper: (index: number) => void;
  isDark: boolean;
  onSetTheme: (dark: boolean) => void;
}

// Split apps into pages of 8 (4x2 grid per page)
const APPS_PER_PAGE = 8;
const iconPadding = 8;
type IconSize = "small" | "medium" | "large";
type IconPosition = { x: number; y: number };

const wallpapers = [
  { name: "Bloom (Default)", gradient: "default" },
  { name: "Sunrise", gradient: "sunrise" },
  { name: "Ocean", gradient: "ocean" },
  { name: "Forest", gradient: "forest" },
  { name: "Sunset", gradient: "sunset" },
];

const iconConfig: Record<
  IconSize,
  { box: number; iconClass: string; labelClass: string; stepX: number; stepY: number; startX: number; startY: number }
> = {
  small: {
    box: 60,
    iconClass: "text-xl",
    labelClass: "text-[10px]",
    stepX: 74,
    stepY: 94,
    startX: 6,
    startY: 10,
  },
  medium: {
    box: 72,
    iconClass: "text-2xl",
    labelClass: "text-[11px]",
    stepX: 82,
    stepY: 108,
    startX: 6,
    startY: 10,
  },
  large: {
    box: 84,
    iconClass: "text-3xl",
    labelClass: "text-xs",
    stepX: 94,
    stepY: 122,
    startX: 4,
    startY: 8,
  },
};

const getGridPosition = (index: number, size: IconSize): IconPosition => {
  const config = iconConfig[size];
  const col = index % 4;
  const row = Math.floor(index / 4);
  return {
    x: config.startX + col * config.stepX,
    y: config.startY + row * config.stepY,
  };
};

const createArrangedIconPositions = (size: IconSize) => {
  const positions: Partial<Record<AppId, IconPosition>> = {};
  desktopApps.forEach((app, index) => {
    const localIndex = index % APPS_PER_PAGE;
    positions[app.id] = getGridPosition(localIndex, size);
  });
  return positions as Record<AppId, IconPosition>;
};

const AndroidHomeScreen = ({
  onOpenApp,
  wallpaperIndex,
  onChangeWallpaper,
  isDark,
  onSetTheme,
}: AndroidHomeScreenProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [iconSize, setIconSize] = useState<IconSize>("medium");
  const [iconPositions, setIconPositions] = useState<Record<AppId, IconPosition>>(
    () => createArrangedIconPositions("medium")
  );
  const [draggingId, setDraggingId] = useState<AppId | null>(null);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dragMetaRef = useRef<{
    id: AppId;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    pageIndex: number;
    moved: boolean;
  } | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const iconMetrics = iconConfig[iconSize];

  const pages = useMemo(() => {
    const result: (typeof desktopApps)[] = [];
    for (let i = 0; i < desktopApps.length; i += APPS_PER_PAGE) {
      result.push(desktopApps.slice(i, i + APPS_PER_PAGE));
    }
    if (result.length < 2) result.push([]);
    return result;
  }, []);

  const filteredApps = searchQuery.trim()
    ? desktopApps.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleRefreshIcons = useCallback(() => {
    setIconPositions(createArrangedIconPositions(iconSize));
  }, [iconSize]);

  const handleChangeIconSize = useCallback((size: IconSize) => {
    setIconSize(size);
    setIconPositions(createArrangedIconPositions(size));
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (draggingId || isSettingsOpen) return;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
    setIsSwiping(true);
  }, [draggingId, isSettingsOpen]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (draggingId || isSettingsOpen) return;
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    // Clamp: don't let swipe beyond first/last page
    const maxOffset = (pages.length - 1) * window.innerWidth;
    const raw = -currentPage * window.innerWidth + dx;
    const clamped = Math.max(-maxOffset, Math.min(0, raw));
    setTranslateX(clamped);
  }, [currentPage, draggingId, isSettingsOpen, pages.length]);

  const handleTouchEnd = useCallback(() => {
    if (draggingId || isSettingsOpen) return;
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
  }, [translateX, currentPage, draggingId, isSettingsOpen]);

  const handleIconTouchStart = useCallback(
    (e: TouchEvent<HTMLButtonElement>, appId: AppId, pageIndex: number) => {
      if (isSearching) return;
      e.stopPropagation();
      const touch = e.touches[0];
      const pageEl = pageRefs.current[pageIndex];
      if (!pageEl) return;
      const pageRect = pageEl.getBoundingClientRect();
      const current = iconPositions[appId] ?? { x: 0, y: 0 };

      dragMetaRef.current = {
        id: appId,
        startX: touch.clientX,
        startY: touch.clientY,
        offsetX: touch.clientX - (pageRect.left + current.x),
        offsetY: touch.clientY - (pageRect.top + current.y),
        pageIndex,
        moved: false,
      };
      setDraggingId(appId);
      setIsSwiping(false);
    },
    [iconPositions, isSearching]
  );

  const handleIconTouchMove = useCallback(
    (e: TouchEvent<HTMLButtonElement>) => {
      if (!dragMetaRef.current) return;
      if (!draggingId) return;
      const touch = e.touches[0];
      e.stopPropagation();
      const pageEl = pageRefs.current[dragMetaRef.current.pageIndex];
      if (!pageEl) return;
      const pageRect = pageEl.getBoundingClientRect();

      const nextX = touch.clientX - pageRect.left - dragMetaRef.current.offsetX;
      const nextY = touch.clientY - pageRect.top - dragMetaRef.current.offsetY;
      const maxX = Math.max(iconPadding, pageRect.width - iconMetrics.box - iconPadding);
      const maxY = Math.max(iconPadding, pageRect.height - iconMetrics.box - iconPadding);
      const clampedX = Math.min(maxX, Math.max(iconPadding, nextX));
      const clampedY = Math.min(maxY, Math.max(iconPadding, nextY));

      const movedX = Math.abs(touch.clientX - dragMetaRef.current.startX);
      const movedY = Math.abs(touch.clientY - dragMetaRef.current.startY);
      if (movedX > 6 || movedY > 6) {
        dragMetaRef.current.moved = true;
      }

      const draggedId = dragMetaRef.current.id;
      setIconPositions((prev) => ({
        ...prev,
        [draggedId]: { x: clampedX, y: clampedY },
      }));
    },
    [draggingId]
  );

  const handleIconTouchEnd = useCallback(
    () => {
      if (!dragMetaRef.current) return;
      const { id, moved, pageIndex } = dragMetaRef.current;

      if (moved) {
        const pageApps = pages[pageIndex] ?? [];
        const currentPos = iconPositions[id] ?? getGridPosition(0, iconSize);
        let bestIndex = 0;
        let bestDistance = Infinity;

        for (let i = 0; i < APPS_PER_PAGE; i++) {
          const slot = getGridPosition(i, iconSize);
          const distance = (slot.x - currentPos.x) ** 2 + (slot.y - currentPos.y) ** 2;
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = i;
          }
        }

        const snapTarget = getGridPosition(bestIndex, iconSize);
        const swappedApp = pageApps.find((app) => {
          if (app.id === id) return false;
          const p = iconPositions[app.id] ?? getGridPosition(0, iconSize);
          return Math.abs(p.x - snapTarget.x) < 1 && Math.abs(p.y - snapTarget.y) < 1;
        });

        setIconPositions((prev) => {
          const next = { ...prev, [id]: snapTarget };
          if (swappedApp) {
            next[swappedApp.id] = prev[id] ?? currentPos;
          }
          return next;
        });
      } else {
        onOpenApp(id);
      }

      dragMetaRef.current = null;
      setDraggingId(null);
    },
    [iconPositions, iconSize, onOpenApp, pages]
  );

  // Compute final transform
  const finalTranslate = isSwiping ? translateX : -currentPage * window.innerWidth;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search bar */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 bg-[hsl(0,0%,100%,0.15)] rounded-full px-4 py-2.5 win-acrylic">
          <Search className="h-4 w-4 text-[hsl(0,0%,100%,0.7)]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            placeholder="Search apps..."
            className="flex-1 bg-transparent text-sm text-[hsl(0,0%,100%)] placeholder:text-[hsl(0,0%,100%,0.5)] outline-none"
            onFocus={() => setIsSearching(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearching(false);
                searchInputRef.current?.blur();
              }}
            >
              <X className="h-4 w-4 text-[hsl(0,0%,100%,0.7)]" />
            </button>
          )}
        </div>
      </div>

      {/* Search results overlay */}
      {isSearching && (
        <div className="flex-1 px-4 pt-2 overflow-auto">
          {filteredApps.length > 0 ? (
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform duration-150"
                  onClick={() => {
                    onOpenApp(app.id);
                    setSearchQuery("");
                    setIsSearching(false);
                  }}
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
          ) : searchQuery.trim() ? (
            <p className="text-center text-sm text-[hsl(0,0%,100%,0.5)] mt-8">No apps found</p>
          ) : (
            <p className="text-center text-sm text-[hsl(0,0%,100%,0.5)] mt-8">Type to search apps</p>
          )}
        </div>
      )}

      {/* Swipeable pages (hidden during search) */}
      {!isSearching && <div
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
              ref={(el) => {
                pageRefs.current[pageIndex] = el;
              }}
            >
              {pageApps.length > 0 ? (
                <div className="relative h-full min-h-[260px]">
                  {pageApps.map((app, pageItemIndex) => {
                    const localIndex = pageItemIndex;
                    const fallback = getGridPosition(localIndex, iconSize);
                    const fallbackX = fallback.x;
                    const fallbackY = fallback.y;
                    const pos = iconPositions[app.id] ?? { x: fallbackX, y: fallbackY };
                    const isDraggingThis = draggingId === app.id;
                    return (
                    <button
                      key={app.id}
                      data-draggable-app="true"
                      className={`absolute flex flex-col items-center gap-1.5 transition-all duration-150 ${
                        isDraggingThis ? "scale-105 z-10" : "active:scale-90"
                      }`}
                      style={{ left: pos.x, top: pos.y, width: iconMetrics.box }}
                      onClick={() => {
                        // Opening handled on touch end to avoid accidental open while dragging.
                      }}
                      onTouchStart={(e) => handleIconTouchStart(e, app.id, pageIndex)}
                      onTouchMove={handleIconTouchMove}
                      onTouchEnd={handleIconTouchEnd}
                      onTouchCancel={handleIconTouchEnd}
                    >
                      <div
                        className="rounded-2xl bg-[hsl(0,0%,100%,0.15)] win-acrylic flex items-center justify-center shadow-lg"
                        style={{ width: iconMetrics.box - 16, height: iconMetrics.box - 16 }}
                      >
                        <span className={iconMetrics.iconClass}>{app.icon}</span>
                      </div>
                      <span
                        className={`${iconMetrics.labelClass} text-[hsl(0,0%,100%)] text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}
                      >
                        {app.name}
                      </span>
                    </button>
                  );
                  })}
                </div>
              ) : (
                <ClockWidget />
              )}
            </div>
          ))}
        </div>
      </div>}

      {/* Page dots */}
      {!isSearching && (
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
      )}

      {/* Dock bar */}
      <div className="mx-4 mb-3 rounded-3xl bg-[hsl(0,0%,100%,0.15)] backdrop-blur-xl px-6 py-3 flex items-center justify-around">
        {[
          { icon: <Phone className="h-6 w-6" />, label: "Phone" },
          { icon: <MessageSquare className="h-6 w-6" />, label: "Messages" },
          { icon: <Settings className="h-6 w-6" />, label: "Settings", onClick: () => setIsSettingsOpen(true) },
          { icon: <Camera className="h-6 w-6" />, label: "Camera" },
        ].map((item) => (
          <button
            key={item.label}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
            onClick={item.onClick}
          >
            <div className="h-12 w-12 rounded-2xl bg-[hsl(0,0%,100%,0.18)] flex items-center justify-center text-[hsl(0,0%,100%)]">
              {item.icon}
            </div>
          </button>
        ))}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-[hsl(0,0%,0%,0.35)] backdrop-blur-sm p-4 flex items-end">
          <div className="w-full rounded-3xl bg-card/95 border border-border p-5 text-card-foreground">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </h3>
              <button
                className="h-8 w-8 rounded-full hover:bg-win-hover flex items-center justify-center"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-secondary/70 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>View</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`rounded-lg px-2 py-1.5 text-xs border ${
                      iconSize === "large"
                        ? "bg-primary/20 border-primary/60 text-foreground"
                        : "bg-background/70 border-transparent text-foreground"
                    }`}
                    onClick={() => handleChangeIconSize("large")}
                  >
                    Large
                  </button>
                  <button
                    className={`rounded-lg px-2 py-1.5 text-xs border ${
                      iconSize === "medium"
                        ? "bg-primary/20 border-primary/60 text-foreground"
                        : "bg-background/70 border-transparent text-foreground"
                    }`}
                    onClick={() => handleChangeIconSize("medium")}
                  >
                    Medium
                  </button>
                  <button
                    className={`rounded-lg px-2 py-1.5 text-xs border ${
                      iconSize === "small"
                        ? "bg-primary/20 border-primary/60 text-foreground"
                        : "bg-background/70 border-transparent text-foreground"
                    }`}
                    onClick={() => handleChangeIconSize("small")}
                  >
                    Small
                  </button>
                </div>
              </div>

              <button
                className="w-full rounded-xl bg-secondary/70 px-3 py-2 flex items-center gap-2 hover:bg-win-hover transition-colors"
                onClick={handleRefreshIcons}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              <div className="rounded-xl bg-secondary/70 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="h-4 w-4" />
                  <span>Change Wallpaper</span>
                </div>
                <div className="space-y-2">
                  {wallpapers.map((wp, i) => (
                    <button
                      key={wp.gradient}
                      className="w-full rounded-lg bg-background/70 hover:bg-win-hover px-2 py-1.5 text-left flex items-center gap-2 transition-colors"
                      onClick={() => onChangeWallpaper(i)}
                    >
                      <div
                        className="h-4 w-4 rounded-sm border border-border"
                        style={{ background: getWallpaperGradient(i, false) }}
                      />
                      <span className="text-xs flex-1">{wp.name}</span>
                      {wallpaperIndex === i && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-secondary/70 p-3">
                <div className="flex items-center gap-2 mb-2">
                  {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>Theme</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`rounded-lg px-2 py-1.5 text-xs border flex items-center justify-center gap-1.5 ${
                      !isDark
                        ? "bg-primary/20 border-primary/60 text-foreground"
                        : "bg-background/70 border-transparent text-foreground"
                    }`}
                    onClick={() => onSetTheme(false)}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light mode
                  </button>
                  <button
                    className={`rounded-lg px-2 py-1.5 text-xs border flex items-center justify-center gap-1.5 ${
                      isDark
                        ? "bg-primary/20 border-primary/60 text-foreground"
                        : "bg-background/70 border-transparent text-foreground"
                    }`}
                    onClick={() => onSetTheme(true)}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark mode
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-muted/60 px-3 py-2 text-muted-foreground flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Display settings
                <span className="ml-auto text-[10px]">Disabled</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AndroidHomeScreen;

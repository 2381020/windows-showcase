import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { AppId } from "@/data/portfolio";
import { desktopApps } from "@/data/portfolio";
import { getWallpaperGradient } from "@/components/windows11/DesktopContextMenu";
import AndroidStatusBar from "./AndroidStatusBar";
import AndroidNavBar from "./AndroidNavBar";
import AndroidHomeScreen from "./AndroidHomeScreen";
import { X } from "lucide-react";
import AboutMe from "@/components/windows11/apps/AboutMe";
import Projects from "@/components/windows11/apps/Projects";
import Resume from "@/components/windows11/apps/Resume";
import Skills from "@/components/windows11/apps/Skills";
import Contact from "@/components/windows11/apps/Contact";

interface AndroidLayoutProps {
  isDark: boolean;
  wallpaperIndex: number;
}

interface MobileWindowState {
  id: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

const appComponents: Record<AppId, React.ReactNode> = {
  about: <AboutMe />,
  projects: <Projects />,
  resume: <Resume />,
  skills: <Skills />,
  contact: <Contact />,
};

const statusBarHeight = 30;
const navBarHeight = 36;
const viewportPadding = 8;

const intersects = (a: MobileWindowState, b: MobileWindowState) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

const AndroidLayout = ({ isDark, wallpaperIndex }: AndroidLayoutProps) => {
  const [windows, setWindows] = useState<MobileWindowState[]>([]);
  const nextZIndexRef = useRef(20);

  const mobileWindowSize = useMemo(() => {
    const width = Math.min(360, Math.max(260, window.innerWidth - 24));
    const availableHeight = window.innerHeight - statusBarHeight - navBarHeight - 32;
    const height = Math.min(560, Math.max(240, availableHeight - 16));
    return { width, height };
  }, []);

  const clampToViewport = useCallback((x: number, y: number, width: number, height: number) => {
    const minX = viewportPadding;
    const minY = statusBarHeight + viewportPadding;
    const maxX = Math.max(minX, window.innerWidth - width - viewportPadding);
    const maxY = Math.max(
      minY,
      window.innerHeight - navBarHeight - height - viewportPadding
    );
    return {
      x: Math.round(Math.min(maxX, Math.max(minX, x))),
      y: Math.round(Math.min(maxY, Math.max(minY, y))),
    };
  }, []);

  const findFreePosition = useCallback(
    (id: AppId, targetX: number, targetY: number, allWindows: MobileWindowState[]) => {
      const start = clampToViewport(
        targetX,
        targetY,
        mobileWindowSize.width,
        mobileWindowSize.height
      );
      const others = allWindows.filter((w) => w.id !== id);
      const candidate: MobileWindowState = {
        id,
        x: start.x,
        y: start.y,
        width: mobileWindowSize.width,
        height: mobileWindowSize.height,
        zIndex: 0,
      };
      if (!others.some((w) => intersects(candidate, w))) {
        return start;
      }

      const step = 18;
      const maxRadius = 20;
      for (let radius = 1; radius <= maxRadius; radius++) {
        for (let ox = -radius; ox <= radius; ox++) {
          for (let oy = -radius; oy <= radius; oy++) {
            if (Math.abs(ox) !== radius && Math.abs(oy) !== radius) continue;
            const probe = clampToViewport(
              start.x + ox * step,
              start.y + oy * step,
              mobileWindowSize.width,
              mobileWindowSize.height
            );
            const probeWindow: MobileWindowState = { ...candidate, x: probe.x, y: probe.y };
            if (!others.some((w) => intersects(probeWindow, w))) {
              return probe;
            }
          }
        }
      }

      return null;
    },
    [clampToViewport, mobileWindowSize.height, mobileWindowSize.width]
  );

  const bringToFront = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: ++nextZIndexRef.current } : w))
    );
  }, []);

  const handleOpenApp = useCallback(
    (id: AppId) => {
      setWindows((prev) => {
        const existing = prev.find((w) => w.id === id);
        if (existing) {
          return prev.map((w) =>
            w.id === id ? { ...w, zIndex: ++nextZIndexRef.current } : w
          );
        }
        const offset = prev.length * 20;
        const placed = findFreePosition(
          id,
          12 + offset,
          statusBarHeight + 12 + offset,
          prev
        );
        if (!placed) return prev;
        return [
          ...prev,
          {
            id,
            x: placed.x,
            y: placed.y,
            width: mobileWindowSize.width,
            height: mobileWindowSize.height,
            zIndex: ++nextZIndexRef.current,
          },
        ];
      });
    },
    [findFreePosition, mobileWindowSize.height, mobileWindowSize.width]
  );

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWindowPosition = useCallback(
    (id: AppId, x: number, y: number) => {
      setWindows((prev) => {
        const current = prev.find((w) => w.id === id);
        if (!current) return prev;

        const position = findFreePosition(id, x, y, prev);
        if (!position) return prev;
        if (position.x === current.x && position.y === current.y) return prev;

        return prev.map((w) =>
          w.id === id ? { ...w, x: position.x, y: position.y } : w
        );
      });
    },
    [findFreePosition]
  );

  return (
    <div
      className="h-[100dvh] w-screen flex flex-col overflow-hidden"
      style={{ background: getWallpaperGradient(wallpaperIndex, isDark) }}
    >
      <AndroidStatusBar />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* Home screen always rendered behind */}
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-300 ease-out ${
            windows.length > 0
              ? "scale-95 opacity-90 pointer-events-none"
              : "scale-100 opacity-100 pointer-events-auto"
          }`}
        >
          <AndroidHomeScreen onOpenApp={handleOpenApp} />
        </div>

        {/* Floating app windows */}
        {windows
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((win) => (
            <MobileWindow
              key={win.id}
              state={win}
              onFocus={bringToFront}
              onMove={updateWindowPosition}
              onClose={closeWindow}
            >
              {appComponents[win.id]}
            </MobileWindow>
          ))}
      </div>

      <AndroidNavBar />
    </div>
  );
};

interface MobileWindowProps {
  state: MobileWindowState;
  onFocus: (id: AppId) => void;
  onMove: (id: AppId, x: number, y: number) => void;
  onClose: (id: AppId) => void;
  children: React.ReactNode;
}

const MobileWindow = ({ state, onFocus, onMove, onClose, children }: MobileWindowProps) => {
  const dragRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const pendingPressRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    element: HTMLDivElement;
  } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [isDragReady, setIsDragReady] = useState(false);

  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearLongPress();
    },
    [clearLongPress]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      onFocus(state.id);

      pendingPressRef.current = {
        pointerId: e.pointerId,
        offsetX: e.clientX - state.x,
        offsetY: e.clientY - state.y,
        startX: e.clientX,
        startY: e.clientY,
        element: e.currentTarget,
      };
      setIsDragReady(false);
      clearLongPress();
      longPressTimerRef.current = window.setTimeout(() => {
        if (!pendingPressRef.current || pendingPressRef.current.pointerId !== e.pointerId) return;
        pendingPressRef.current.element.setPointerCapture(e.pointerId);
        dragRef.current = {
          pointerId: pendingPressRef.current.pointerId,
          offsetX: pendingPressRef.current.offsetX,
          offsetY: pendingPressRef.current.offsetY,
        };
        pendingPressRef.current = null;
        setIsDragReady(true);
      }, 220);
    },
    [clearLongPress, onFocus, state.id, state.x, state.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (pendingPressRef.current && pendingPressRef.current.pointerId === e.pointerId) {
        const dx = Math.abs(e.clientX - pendingPressRef.current.startX);
        const dy = Math.abs(e.clientY - pendingPressRef.current.startY);
        if (dx > 8 || dy > 8) {
          clearLongPress();
          pendingPressRef.current = null;
        }
      }

      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      onMove(state.id, e.clientX - dragRef.current.offsetX, e.clientY - dragRef.current.offsetY);
    },
    [clearLongPress, onMove, state.id]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    clearLongPress();

    if (pendingPressRef.current && pendingPressRef.current.pointerId === e.pointerId) {
      pendingPressRef.current = null;
      setIsDragReady(false);
      return;
    }

    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    if (dragRef.current && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setIsDragReady(false);
  }, [clearLongPress]);

  const app = desktopApps.find((item) => item.id === state.id);

  return (
    <div
      className="absolute rounded-2xl overflow-hidden border border-border bg-background/95 backdrop-blur-md shadow-2xl"
      style={{
        top: state.y,
        left: state.x,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex,
      }}
      onPointerDown={() => onFocus(state.id)}
    >
      <div
        className={`h-10 px-3 flex items-center gap-2 bg-primary/90 text-primary-foreground select-none ${
          isDragReady ? "cursor-grabbing" : "cursor-move"
        }`}
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <span className="text-sm">{app?.icon}</span>
        <span className="text-sm font-medium flex-1 truncate">{app?.name}</span>
        <button
          className="h-7 w-7 rounded-md hover:bg-[hsl(0,0%,100%,0.2)] flex items-center justify-center"
          onClick={() => onClose(state.id)}
          aria-label="Close app"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="h-[calc(100%-40px)] overflow-auto p-3">{children}</div>
    </div>
  );
};

export default AndroidLayout;

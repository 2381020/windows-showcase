import { useState, useCallback, useEffect } from "react";
import type { AppId } from "@/data/portfolio";

export interface WindowState {
  id: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

const defaultSizes: Record<AppId, { w: number; h: number }> = {
  about: { w: 600, h: 500 },
  projects: { w: 700, h: 550 },
  resume: { w: 650, h: 550 },
  skills: { w: 600, h: 500 },
  contact: { w: 500, h: 520 },
};
const minWidth = 420;
const minHeight = 280;

const taskbarHeight = 48;
const viewportPadding = 0;

const clamp = (value: number, min: number, max: number) => {
  if (max <= min) return min;
  return Math.min(max, Math.max(min, value));
};

const getNextZIndex = (windows: WindowState[]) =>
  windows.reduce((top, win) => Math.max(top, win.zIndex), 9) + 1;

const bringToFront = (windows: WindowState[], id: AppId) => {
  const nextZ = getNextZIndex(windows);
  return windows.map((w) => (w.id === id ? { ...w, zIndex: nextZ } : w));
};

const clampPositionToViewport = (
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const maxX = Math.max(viewportPadding, window.innerWidth - width - viewportPadding);
  const maxY = Math.max(
    viewportPadding,
    window.innerHeight - taskbarHeight - height - viewportPadding
  );

  return {
    x: Math.round(clamp(x, viewportPadding, maxX)),
    y: Math.round(clamp(y, viewportPadding, maxY)),
  };
};

const clampSizeToViewport = (x: number, y: number, width: number, height: number) => {
  const maxWidth = Math.max(minWidth, window.innerWidth - x - viewportPadding);
  const maxHeight = Math.max(
    minHeight,
    window.innerHeight - taskbarHeight - y - viewportPadding
  );
  return {
    width: Math.round(clamp(width, minWidth, maxWidth)),
    height: Math.round(clamp(height, minHeight, maxHeight)),
  };
};

const clampWindowRectToViewport = (x: number, y: number, width: number, height: number) => {
  const nextPos = clampPositionToViewport(x, y, width, height);
  const nextSize = clampSizeToViewport(nextPos.x, nextPos.y, width, height);
  return { x: nextPos.x, y: nextPos.y, width: nextSize.width, height: nextSize.height };
};

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.maximized) return w;
          const nextRect = clampWindowRectToViewport(w.x, w.y, w.width, w.height);
          if (
            nextRect.x === w.x &&
            nextRect.y === w.y &&
            nextRect.width === w.width &&
            nextRect.height === w.height
          ) {
            return w;
          }
          return {
            ...w,
            x: nextRect.x,
            y: nextRect.y,
            width: nextRect.width,
            height: nextRect.height,
          };
        })
      );
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openWindow = useCallback((id: AppId) => {
    setWindows((prev) => {
      const nextZ = getNextZIndex(prev);
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        // If minimized, restore; always bring to front
        return bringToFront(
          prev.map((w) => (w.id === id ? { ...w, minimized: false } : w)),
          id
        );
      }
      const size = defaultSizes[id];
      const x = 100 + prev.length * 30;
      const y = 60 + prev.length * 30;
      const nextPos = clampPositionToViewport(x, y, size.w, size.h);
      return [
        ...prev,
        {
          id,
          x: nextPos.x,
          y: nextPos.y,
          width: size.w,
          height: size.h,
          minimized: false,
          maximized: false,
          zIndex: nextZ,
        },
      ];
    });
  }, []);

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  }, []);

  const maximizeWindow = useCallback((id: AppId) => {
    setWindows((prev) => {
      const updated = prev.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      );
      return bringToFront(updated, id);
    });
  }, []);

  const focusWindow = useCallback((id: AppId) => {
    setWindows((prev) => {
      const target = prev.find((w) => w.id === id);
      if (!target) return prev;
      const topZ = prev.reduce((top, w) => Math.max(top, w.zIndex), 9);
      if (target.zIndex === topZ) return prev;
      return bringToFront(prev, id);
    });
  }, []);

  const updatePosition = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id || w.maximized) return w;
        const nextPos = clampPositionToViewport(x, y, w.width, w.height);
        if (nextPos.x === w.x && nextPos.y === w.y) return w;
        return { ...w, x: nextPos.x, y: nextPos.y };
      })
    );
  }, []);

  const updateSize = useCallback((id: AppId, width: number, height: number) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id !== id || w.maximized) return w;
        const nextSize = clampSizeToViewport(w.x, w.y, width, height);
        if (nextSize.width === w.width && nextSize.height === w.height) return w;
        return { ...w, width: nextSize.width, height: nextSize.height };
      })
    );
  }, []);

  const updateBounds = useCallback(
    (id: AppId, x: number, y: number, width: number, height: number) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.id !== id || w.maximized) return w;
          const nextRect = clampWindowRectToViewport(x, y, width, height);
          if (
            nextRect.x === w.x &&
            nextRect.y === w.y &&
            nextRect.width === w.width &&
            nextRect.height === w.height
          ) {
            return w;
          }
          return {
            ...w,
            x: nextRect.x,
            y: nextRect.y,
            width: nextRect.width,
            height: nextRect.height,
          };
        })
      );
    },
    []
  );

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
    updateSize,
    updateBounds,
  };
}

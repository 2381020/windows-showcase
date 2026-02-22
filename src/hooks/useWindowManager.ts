import { useState, useCallback } from "react";
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

let nextZIndex = 10;

const defaultSizes: Record<AppId, { w: number; h: number }> = {
  about: { w: 600, h: 500 },
  projects: { w: 700, h: 550 },
  resume: { w: 650, h: 550 },
  skills: { w: 600, h: 500 },
  contact: { w: 500, h: 520 },
};

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openWindow = useCallback((id: AppId) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        // If minimized, restore; always bring to front
        return prev.map((w) =>
          w.id === id ? { ...w, minimized: false, zIndex: ++nextZIndex } : w
        );
      }
      const size = defaultSizes[id];
      const x = 100 + prev.length * 30;
      const y = 60 + prev.length * 30;
      return [
        ...prev,
        {
          id,
          x: Math.min(x, window.innerWidth - size.w - 50),
          y: Math.min(y, window.innerHeight - size.h - 100),
          width: size.w,
          height: size.h,
          minimized: false,
          maximized: false,
          zIndex: ++nextZIndex,
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
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized, zIndex: ++nextZIndex } : w
      )
    );
  }, []);

  const focusWindow = useCallback((id: AppId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: ++nextZIndex } : w))
    );
  }, []);

  const updatePosition = useCallback((id: AppId, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
  };
}

import { desktopApps, type AppId } from "@/data/portfolio";
import DesktopContextMenu, { getWallpaperGradient } from "./DesktopContextMenu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DesktopProps {
  isDark: boolean;
  onOpenApp: (id: AppId) => void;
  wallpaperIndex: number;
  onChangeWallpaper: (index: number) => void;
}

const iconSizeMap = {
  small: { box: "w-16 h-16", icon: "text-2xl", text: "text-[10px]" },
  medium: { box: "w-20 h-20", icon: "text-3xl", text: "text-[11px]" },
  large: { box: "w-24 h-24", icon: "text-4xl", text: "text-xs" },
};

type IconPosition = { x: number; y: number };

const iconStep = 96;
const taskbarHeight = 48;

const createArrangedPositions = (step: number) => {
  const positions: Partial<Record<AppId, IconPosition>> = {};
  const availableHeight = Math.max(step, window.innerHeight - taskbarHeight - 32);
  const rowsPerColumn = Math.max(1, Math.floor(availableHeight / step));

  desktopApps.forEach((app, index) => {
    const row = index % rowsPerColumn;
    const column = Math.floor(index / rowsPerColumn);
    positions[app.id] = {
      x: 16 + column * step,
      y: 16 + row * step,
    };
  });
  return positions as Record<AppId, IconPosition>;
};

const Desktop = ({ isDark, onOpenApp, wallpaperIndex, onChangeWallpaper }: DesktopProps) => {
  const [iconSize, setIconSize] = useState<"small" | "medium" | "large">("medium");
  const [iconPositions, setIconPositions] = useState<Record<AppId, IconPosition>>(
    () => createArrangedPositions(iconStep)
  );
  const [draggingId, setDraggingId] = useState<AppId | null>(null);
  const sizes = iconSizeMap[iconSize];
  const dragRef = useRef<{
    id: AppId;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const iconDimension = useMemo(() => {
    if (iconSize === "small") return 64;
    if (iconSize === "large") return 96;
    return 80;
  }, [iconSize]);
  const arrangeStep = iconDimension + 16;

  const handleIconMouseDown = useCallback(
    (e: React.MouseEvent, id: AppId) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const current = iconPositions[id];
      if (!current) return;

      dragRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: current.x,
        originY: current.y,
      };
      setDraggingId(id);
    },
    [iconPositions]
  );

  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, startX, startY, originX, originY } = dragRef.current;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const maxX = Math.max(16, window.innerWidth - iconDimension - 16);
      const maxY = Math.max(16, window.innerHeight - taskbarHeight - iconDimension - 16);

      const nextX = Math.min(maxX, Math.max(16, originX + dx));
      const nextY = Math.min(maxY, Math.max(16, originY + dy));

      setIconPositions((prev) => ({ ...prev, [id]: { x: nextX, y: nextY } }));
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setDraggingId(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, iconDimension]);

  const handleRefresh = useCallback(() => {
    dragRef.current = null;
    setDraggingId(null);
    setIconPositions(createArrangedPositions(arrangeStep));
  }, [arrangeStep]);

  return (
    <DesktopContextMenu
      iconSize={iconSize}
      onChangeIconSize={setIconSize}
      wallpaperIndex={wallpaperIndex}
      onChangeWallpaper={onChangeWallpaper}
      onRefresh={handleRefresh}
    >
      <div
        className="fixed inset-0 pb-12 overflow-hidden select-none"
        style={{ background: getWallpaperGradient(wallpaperIndex, isDark) }}
      >
        <div className="relative p-4 h-[calc(100%-48px)]">
          {desktopApps.map((app) => (
            <button
              key={app.id}
              className={`absolute flex flex-col items-center justify-center ${sizes.box} rounded-md hover:bg-[hsl(0,0%,100%,0.1)] transition-colors group cursor-grab active:cursor-grabbing ${
                draggingId === app.id ? "bg-[hsl(0,0%,100%,0.12)]" : ""
              }`}
              style={{
                left: iconPositions[app.id]?.x ?? 16,
                top: iconPositions[app.id]?.y ?? 16,
              }}
              onMouseDown={(e) => handleIconMouseDown(e, app.id)}
              onDoubleClick={() => onOpenApp(app.id)}
            >
              <span className={`${sizes.icon} mb-1 group-hover:scale-110 transition-transform`}>
                {app.icon}
              </span>
              <span className={`${sizes.text} text-[hsl(0,0%,100%)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-center leading-tight`}>
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </DesktopContextMenu>
  );
};

export default Desktop;

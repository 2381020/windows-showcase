import { desktopApps, type AppId } from "@/data/portfolio";
import DesktopContextMenu, { getWallpaperGradient } from "./DesktopContextMenu";
import { useState } from "react";

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

const Desktop = ({ isDark, onOpenApp, wallpaperIndex, onChangeWallpaper }: DesktopProps) => {
  const [iconSize, setIconSize] = useState<"small" | "medium" | "large">("medium");
  const [refreshKey, setRefreshKey] = useState(0);
  const sizes = iconSizeMap[iconSize];

  return (
    <DesktopContextMenu
      iconSize={iconSize}
      onChangeIconSize={setIconSize}
      wallpaperIndex={wallpaperIndex}
      onChangeWallpaper={onChangeWallpaper}
      onRefresh={() => setRefreshKey((k) => k + 1)}
    >
      <div
        className="fixed inset-0 pb-12 overflow-hidden select-none"
        style={{ background: getWallpaperGradient(wallpaperIndex, isDark) }}
      >
        <div key={refreshKey} className="flex flex-col flex-wrap gap-1 p-4 h-[calc(100%-48px)]">
          {desktopApps.map((app) => (
            <button
              key={app.id}
              className={`flex flex-col items-center justify-center ${sizes.box} rounded-md hover:bg-[hsl(0,0%,100%,0.1)] transition-colors group`}
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

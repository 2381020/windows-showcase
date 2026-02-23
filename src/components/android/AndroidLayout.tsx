import { useState, useCallback } from "react";
import type { AppId } from "@/data/portfolio";
import { getWallpaperGradient } from "@/components/windows11/DesktopContextMenu";
import AndroidStatusBar from "./AndroidStatusBar";
import AndroidNavBar from "./AndroidNavBar";
import AndroidHomeScreen from "./AndroidHomeScreen";
import AndroidAppView from "./AndroidAppView";

interface AndroidLayoutProps {
  isDark: boolean;
  wallpaperIndex: number;
}

const AndroidLayout = ({ isDark, wallpaperIndex }: AndroidLayoutProps) => {
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  const [closing, setClosing] = useState(false);

  const handleOpenApp = useCallback((id: AppId) => {
    setOpenApp(id);
    setClosing(false);
  }, []);

  const handleBack = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpenApp(null);
      setClosing(false);
    }, 250);
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: getWallpaperGradient(wallpaperIndex, isDark) }}
    >
      <AndroidStatusBar />

      <div className="flex-1 relative overflow-hidden">
        {/* Home screen always rendered behind */}
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-300 ease-out ${
            openApp && !closing ? "scale-90 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <AndroidHomeScreen onOpenApp={handleOpenApp} />
        </div>

        {/* App overlay */}
        {openApp && (
          <div
            className={`absolute inset-0 flex flex-col ${
              closing ? "animate-android-slide-out" : "animate-android-slide-in"
            }`}
          >
            <AndroidAppView appId={openApp} onBack={handleBack} />
          </div>
        )}
      </div>

      <AndroidNavBar />
    </div>
  );
};

export default AndroidLayout;

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
  onChangeWallpaper: (index: number) => void;
  onSetTheme: (dark: boolean) => void;
}

const AndroidLayout = ({
  isDark,
  wallpaperIndex,
  onChangeWallpaper,
  onSetTheme,
}: AndroidLayoutProps) => {
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
    }, 180);
  }, []);

  return (
    <div
      className="h-[100dvh] w-screen flex flex-col overflow-hidden"
      style={{ background: getWallpaperGradient(wallpaperIndex, isDark) }}
    >
      <AndroidStatusBar />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        {/* Home screen: unmount while app is open for better performance */}
        {(!openApp || closing) && (
          <div className="absolute inset-0 flex flex-col">
            <AndroidHomeScreen
              onOpenApp={handleOpenApp}
              wallpaperIndex={wallpaperIndex}
              onChangeWallpaper={onChangeWallpaper}
            isDark={isDark}
            onSetTheme={onSetTheme}
            />
          </div>
        )}

        {/* App overlay */}
        {openApp && (
          <div
            className={`absolute inset-0 z-20 flex flex-col ${
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

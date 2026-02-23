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

  const handleOpenApp = useCallback((id: AppId) => {
    setOpenApp(id);
  }, []);

  const handleBack = useCallback(() => {
    setOpenApp(null);
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ background: getWallpaperGradient(wallpaperIndex, isDark) }}
    >
      <AndroidStatusBar />

      {openApp ? (
        <AndroidAppView appId={openApp} onBack={handleBack} />
      ) : (
        <AndroidHomeScreen onOpenApp={handleOpenApp} />
      )}

      <AndroidNavBar />
    </div>
  );
};

export default AndroidLayout;

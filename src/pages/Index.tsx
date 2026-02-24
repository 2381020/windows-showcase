import { useState, useCallback, useEffect } from "react";
import BootScreen from "@/components/windows11/BootScreen";
import LockScreen from "@/components/windows11/LockScreen";
import Desktop from "@/components/windows11/Desktop";
import Taskbar from "@/components/windows11/Taskbar";
import StartMenu from "@/components/windows11/StartMenu";
import Window from "@/components/windows11/Window";
import AndroidLayout from "@/components/android/AndroidLayout";
import AboutMe from "@/components/windows11/apps/AboutMe";
import Projects from "@/components/windows11/apps/Projects";
import Resume from "@/components/windows11/apps/Resume";
import Skills from "@/components/windows11/apps/Skills";
import Contact from "@/components/windows11/apps/Contact";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AppId } from "@/data/portfolio";

const appComponents: Record<AppId, React.ReactNode> = {
  about: <AboutMe />,
  projects: <Projects />,
  resume: <Resume />,
  skills: <Skills />,
  contact: <Contact />,
};

const Index = () => {
  const [phase, setPhase] = useState<"boot" | "lock" | "desktop">("boot");
  const [isDark, setIsDark] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const wm = useWindowManager();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleOpenApp = useCallback(
    (id: AppId) => {
      wm.openWindow(id);
      setStartMenuOpen(false);
    },
    [wm]
  );

  if (phase === "boot") {
    return <BootScreen onComplete={() => setPhase("lock")} />;
  }

  if (phase === "lock") {
    return <LockScreen onUnlock={() => setPhase("desktop")} />;
  }

  if (isMobile) {
    return <AndroidLayout isDark={isDark} wallpaperIndex={wallpaperIndex} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <Desktop isDark={isDark} onOpenApp={handleOpenApp} wallpaperIndex={wallpaperIndex} onChangeWallpaper={setWallpaperIndex} />

      {wm.windows.map((win) => (
        <Window
          key={win.id}
          state={win}
          onClose={wm.closeWindow}
          onMinimize={wm.minimizeWindow}
          onMaximize={wm.maximizeWindow}
          onFocus={wm.focusWindow}
          onUpdatePosition={wm.updatePosition}
          onUpdateBounds={wm.updateBounds}
        >
          {appComponents[win.id]}
        </Window>
      ))}

      <StartMenu
        isOpen={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onOpenApp={handleOpenApp}
      />

      <Taskbar
        windows={wm.windows}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onToggleStartMenu={() => setStartMenuOpen(!startMenuOpen)}
        onOpenApp={handleOpenApp}
        startMenuOpen={startMenuOpen}
      />
    </div>
  );
};

export default Index;

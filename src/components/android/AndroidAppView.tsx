import { useRef, useState, useCallback, type TouchEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { desktopApps, type AppId } from "@/data/portfolio";
import AboutMe from "@/components/windows11/apps/AboutMe";
import Projects from "@/components/windows11/apps/Projects";
import Resume from "@/components/windows11/apps/Resume";
import Skills from "@/components/windows11/apps/Skills";
import Contact from "@/components/windows11/apps/Contact";

const appComponents: Record<AppId, React.ReactNode> = {
  about: <AboutMe />,
  projects: <Projects />,
  resume: <Resume />,
  skills: <Skills />,
  contact: <Contact />,
};

interface AndroidAppViewProps {
  appId: AppId;
  onBack: () => void;
}

const AndroidAppView = ({ appId, onBack }: AndroidAppViewProps) => {
  const app = desktopApps.find((a) => a.id === appId);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    // Start swipe-back from screen edge, similar to mobile gesture navigation.
    if (touch.clientX > 32) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dy) > Math.abs(dx) && dx < 12) return;
    if (dx <= 0) {
      setSwipeX(0);
      return;
    }

    setSwipeX(Math.min(window.innerWidth, dx));
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current) return;
    const shouldClose = swipeX > window.innerWidth * 0.28;
    touchStartRef.current = null;
    setIsSwiping(false);

    if (shouldClose) {
      onBack();
      setSwipeX(0);
      return;
    }

    setSwipeX(0);
  }, [swipeX, onBack]);

  const swipeProgress = Math.min(1, swipeX / Math.max(1, window.innerWidth));

  return (
    <div
      className="flex-1 min-h-0 flex flex-col bg-background/95 backdrop-blur-md text-foreground"
      style={{
        transform: `translateX(${swipeX}px)`,
        opacity: 1 - swipeProgress * 0.25,
        transition: isSwiping ? "none" : "transform 220ms ease, opacity 220ms ease",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* App toolbar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[hsl(0,0%,100%,0.15)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-primary-foreground" />
        </button>
        <span className="text-lg">{app?.icon}</span>
        <span className="text-base font-medium truncate">{app?.name}</span>
      </div>

      {/* App content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-6">
        {appComponents[appId]}
      </div>
    </div>
  );
};

export default AndroidAppView;

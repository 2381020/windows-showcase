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

  return (
    <div className="flex-1 flex flex-col bg-card text-card-foreground animate-android-slide-in">
      {/* App toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary">
        <button
          onClick={onBack}
          className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[hsl(0,0%,100%,0.15)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-primary-foreground" />
        </button>
        <span className="text-base font-medium text-primary-foreground">{app?.name}</span>
      </div>

      {/* App content */}
      <div className="flex-1 overflow-auto p-4">
        {appComponents[appId]}
      </div>
    </div>
  );
};

export default AndroidAppView;

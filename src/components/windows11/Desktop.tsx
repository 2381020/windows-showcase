import { desktopApps, type AppId } from "@/data/portfolio";

interface DesktopProps {
  isDark: boolean;
  onOpenApp: (id: AppId) => void;
}

const Desktop = ({ isDark, onOpenApp }: DesktopProps) => {
  return (
    <div
      className="fixed inset-0 pb-12 overflow-hidden select-none"
      style={{
        background: isDark
          ? "linear-gradient(135deg, hsl(220, 30%, 12%) 0%, hsl(240, 25%, 18%) 40%, hsl(207, 50%, 20%) 100%)"
          : "linear-gradient(135deg, hsl(207, 80%, 60%) 0%, hsl(220, 70%, 55%) 40%, hsl(260, 50%, 55%) 100%)",
      }}
    >
      {/* Desktop icons */}
      <div className="flex flex-col flex-wrap gap-1 p-4 h-[calc(100%-48px)]">
        {desktopApps.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center justify-center w-20 h-20 rounded-md hover:bg-[hsl(0,0%,100%,0.1)] transition-colors group"
            onDoubleClick={() => onOpenApp(app.id)}
          >
            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
              {app.icon}
            </span>
            <span className="text-[11px] text-[hsl(0,0%,100%)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-center leading-tight">
              {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Desktop;

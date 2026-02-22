import { desktopApps, type AppId } from "@/data/portfolio";
import { Search, Power } from "lucide-react";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
}

const StartMenu = ({ isOpen, onClose, onOpenApp }: StartMenuProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[69]" onClick={onClose} />

      {/* Menu */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-[580px] max-w-[calc(100vw-2rem)] rounded-lg bg-win-start-menu/95 win-acrylic win-shadow border border-border z-[70] animate-start-menu-open overflow-hidden">
        {/* Search */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search apps</span>
          </div>
        </div>

        {/* Pinned */}
        <div className="px-6 py-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Pinned</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {desktopApps.map((app) => (
              <button
                key={app.id}
                className="flex flex-col items-center justify-center p-3 rounded-md hover:bg-win-hover transition-colors"
                onClick={() => {
                  onOpenApp(app.id);
                  onClose();
                }}
              >
                <span className="text-2xl mb-1">{app.icon}</span>
                <span className="text-[11px] text-foreground text-center leading-tight">
                  {app.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recommended / User section */}
        <div className="border-t border-border mt-2 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm text-primary-foreground font-semibold">JD</span>
              </div>
              <span className="text-sm font-medium text-foreground">John Doe</span>
            </div>
            <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-win-hover transition-colors">
              <Power className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default StartMenu;

import { useState } from "react";
import { desktopApps, type AppId } from "@/data/portfolio";
import { Search } from "lucide-react";

interface AndroidHomeScreenProps {
  onOpenApp: (id: AppId) => void;
}

const AndroidHomeScreen = ({ onOpenApp }: AndroidHomeScreenProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = desktopApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col px-4 pt-6 pb-2 overflow-auto">
      {/* Google-style search bar */}
      <div className="flex items-center gap-2 bg-[hsl(0,0%,100%,0.15)] rounded-full px-4 py-2.5 mb-8 win-acrylic">
        <Search className="h-4 w-4 text-[hsl(0,0%,100%,0.7)]" />
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[hsl(0,0%,100%)] placeholder:text-[hsl(0,0%,100%,0.5)] outline-none"
        />
      </div>

      {/* App grid */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-2">
        {filteredApps.map((app) => (
          <button
            key={app.id}
            className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
            onClick={() => onOpenApp(app.id)}
          >
            <div className="h-14 w-14 rounded-2xl bg-[hsl(0,0%,100%,0.15)] win-acrylic flex items-center justify-center shadow-lg">
              <span className="text-2xl">{app.icon}</span>
            </div>
            <span className="text-[11px] text-[hsl(0,0%,100%)] text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              {app.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AndroidHomeScreen;

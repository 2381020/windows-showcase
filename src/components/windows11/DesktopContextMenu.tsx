import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Monitor, RefreshCw, LayoutGrid, LayoutList, Image } from "lucide-react";

interface DesktopContextMenuProps {
  children: React.ReactNode;
  iconSize: "small" | "medium" | "large";
  onChangeIconSize: (size: "small" | "medium" | "large") => void;
  wallpaperIndex: number;
  onChangeWallpaper: (index: number) => void;
  onRefresh: () => void;
}

const wallpapers = [
  { name: "Bloom (Default)", gradient: "default" },
  { name: "Sunrise", gradient: "sunrise" },
  { name: "Ocean", gradient: "ocean" },
  { name: "Forest", gradient: "forest" },
  { name: "Sunset", gradient: "sunset" },
];

const DesktopContextMenu = ({
  children,
  iconSize,
  onChangeIconSize,
  wallpaperIndex,
  onChangeWallpaper,
  onRefresh,
}: DesktopContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-[hsl(0,0%,96%,0.85)] dark:bg-[hsl(0,0%,15%,0.85)] backdrop-blur-xl border-[hsl(0,0%,80%)] dark:border-[hsl(0,0%,25%)] rounded-lg shadow-2xl">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            View
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent className="bg-[hsl(0,0%,96%,0.85)] dark:bg-[hsl(0,0%,15%,0.85)] backdrop-blur-xl border-[hsl(0,0%,80%)] dark:border-[hsl(0,0%,25%)] rounded-lg">
              <ContextMenuItem
                className="gap-2"
                onClick={() => onChangeIconSize("large")}
              >
                <LayoutGrid className="h-4 w-4" />
                Large icons
                {iconSize === "large" && <span className="ml-auto text-xs">✓</span>}
              </ContextMenuItem>
              <ContextMenuItem
                className="gap-2"
                onClick={() => onChangeIconSize("medium")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Medium icons
                {iconSize === "medium" && <span className="ml-auto text-xs">✓</span>}
              </ContextMenuItem>
              <ContextMenuItem
                className="gap-2"
                onClick={() => onChangeIconSize("small")}
              >
                <LayoutList className="h-4 w-4" />
                Small icons
                {iconSize === "small" && <span className="ml-auto text-xs">✓</span>}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem className="gap-2" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Image className="h-4 w-4" />
            Change Wallpaper
          </ContextMenuSubTrigger>
          <ContextMenuPortal>
            <ContextMenuSubContent className="bg-[hsl(0,0%,96%,0.85)] dark:bg-[hsl(0,0%,15%,0.85)] backdrop-blur-xl border-[hsl(0,0%,80%)] dark:border-[hsl(0,0%,25%)] rounded-lg">
              {wallpapers.map((wp, i) => (
                <ContextMenuItem
                  key={wp.gradient}
                  className="gap-2"
                  onClick={() => onChangeWallpaper(i)}
                >
                  <div
                    className="h-4 w-4 rounded-sm border border-[hsl(0,0%,70%)]"
                    style={{ background: getWallpaperPreview(i, false) }}
                  />
                  {wp.name}
                  {wallpaperIndex === i && <span className="ml-auto text-xs">✓</span>}
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuPortal>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem className="gap-2" disabled>
          <Monitor className="h-4 w-4" />
          Display settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export function getWallpaperGradient(index: number, isDark: boolean): string {
  const gradients = isDark
    ? [
        "linear-gradient(135deg, hsl(220,30%,12%) 0%, hsl(240,25%,18%) 40%, hsl(207,50%,20%) 100%)",
        "linear-gradient(135deg, hsl(30,30%,12%) 0%, hsl(20,40%,15%) 40%, hsl(40,35%,18%) 100%)",
        "linear-gradient(135deg, hsl(200,40%,10%) 0%, hsl(190,50%,14%) 40%, hsl(210,45%,18%) 100%)",
        "linear-gradient(135deg, hsl(140,30%,10%) 0%, hsl(160,35%,14%) 40%, hsl(130,30%,18%) 100%)",
        "linear-gradient(135deg, hsl(280,30%,12%) 0%, hsl(320,30%,16%) 40%, hsl(350,35%,18%) 100%)",
      ]
    : [
        "linear-gradient(135deg, hsl(207,80%,60%) 0%, hsl(220,70%,55%) 40%, hsl(260,50%,55%) 100%)",
        "linear-gradient(135deg, hsl(40,90%,65%) 0%, hsl(25,85%,55%) 40%, hsl(350,60%,55%) 100%)",
        "linear-gradient(135deg, hsl(190,80%,55%) 0%, hsl(200,70%,50%) 40%, hsl(220,60%,50%) 100%)",
        "linear-gradient(135deg, hsl(130,60%,50%) 0%, hsl(150,55%,45%) 40%, hsl(170,50%,40%) 100%)",
        "linear-gradient(135deg, hsl(280,70%,60%) 0%, hsl(320,60%,55%) 40%, hsl(350,70%,55%) 100%)",
      ];
  return gradients[index] || gradients[0];
}

function getWallpaperPreview(index: number, isDark: boolean): string {
  return getWallpaperGradient(index, isDark);
}

export default DesktopContextMenu;

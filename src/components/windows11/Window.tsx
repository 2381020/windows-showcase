import { useRef, useEffect, useCallback, useState } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import type { AppId } from "@/data/portfolio";
import { desktopApps } from "@/data/portfolio";
import type { WindowState } from "@/hooks/useWindowManager";

interface WindowProps {
  state: WindowState;
  onClose: (id: AppId) => void;
  onMinimize: (id: AppId) => void;
  onMaximize: (id: AppId) => void;
  onFocus: (id: AppId) => void;
  onUpdatePosition: (id: AppId, x: number, y: number) => void;
  children: React.ReactNode;
}

const Window = ({
  state,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  children,
}: WindowProps) => {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const app = desktopApps.find((a) => a.id === state.id);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.preventDefault();
      onFocus(state.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: state.x,
        origY: state.y,
      };
      setIsDragging(true);
    },
    [state.id, state.x, state.y, onFocus]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      onUpdatePosition(
        state.id,
        dragRef.current.origX + dx,
        Math.max(0, dragRef.current.origY + dy)
      );
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, state.id, onUpdatePosition]);

  if (state.minimized) return null;

  const style: React.CSSProperties = state.maximized
    ? { top: 0, left: 0, width: "100%", height: "calc(100% - 48px)", zIndex: state.zIndex }
    : {
        top: state.y,
        left: state.x,
        width: state.width,
        height: state.height,
        zIndex: state.zIndex,
      };

  return (
    <div
      className="fixed animate-window-open rounded-lg overflow-hidden border border-win-window-border bg-win-window win-shadow flex flex-col"
      style={style}
      onMouseDown={() => onFocus(state.id)}
    >
      {/* Title bar */}
      <div
        className="flex items-center h-9 px-3 bg-win-titlebar-active select-none shrink-0 cursor-default"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm mr-2">{app?.icon}</span>
        <span className="text-xs font-medium text-foreground flex-1">{app?.name}</span>
        <div className="flex">
          <button
            className="h-9 w-11 flex items-center justify-center hover:bg-win-hover transition-colors"
            onClick={() => onMinimize(state.id)}
          >
            <Minus className="h-3.5 w-3.5 text-foreground" />
          </button>
          <button
            className="h-9 w-11 flex items-center justify-center hover:bg-win-hover transition-colors"
            onClick={() => onMaximize(state.id)}
          >
            {state.maximized ? (
              <Copy className="h-3 w-3 text-foreground" />
            ) : (
              <Square className="h-3 w-3 text-foreground" />
            )}
          </button>
          <button
            className="h-9 w-11 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
            onClick={() => onClose(state.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
};

export default Window;

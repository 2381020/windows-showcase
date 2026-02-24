import { useRef, useCallback, useState, useEffect } from "react";
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
  onUpdateBounds: (id: AppId, x: number, y: number, width: number, height: number) => void;
  children: React.ReactNode;
}

type ResizeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const Window = ({
  state,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  onUpdateBounds,
  children,
}: WindowProps) => {
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    direction: ResizeDirection;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const pendingBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(
    null
  );
  const animationFrameRef = useRef<number | null>(null);
  const resizeAnimationFrameRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const app = desktopApps.find((a) => a.id === state.id);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (state.maximized) return;
      if ((e.target as HTMLElement).closest("button")) return;
      if (e.button !== 0) return;
      e.preventDefault();
      onFocus(state.id);
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        offsetX: e.clientX - state.x,
        offsetY: e.clientY - state.y,
      };
      setIsDragging(true);
    },
    [state.id, state.x, state.y, state.maximized, onFocus]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      if (e.pointerId !== dragRef.current.pointerId) return;

      const nextX = e.clientX - dragRef.current.offsetX;
      const nextY = e.clientY - dragRef.current.offsetY;
      pendingPositionRef.current = {
        x: Math.round(nextX),
        y: Math.round(nextY),
      };

      if (animationFrameRef.current !== null) return;
      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        if (!pendingPositionRef.current) return;
        onUpdatePosition(state.id, pendingPositionRef.current.x, pendingPositionRef.current.y);
      });
    },
    [state.id, onUpdatePosition]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      if (e.pointerId !== dragRef.current.pointerId) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (pendingPositionRef.current) {
        onUpdatePosition(state.id, pendingPositionRef.current.x, pendingPositionRef.current.y);
      }
      pendingPositionRef.current = null;
      dragRef.current = null;
      setIsDragging(false);
    },
    [state.id, onUpdatePosition]
  );

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, direction: ResizeDirection) => {
      if (state.maximized) return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      onFocus(state.id);
      e.currentTarget.setPointerCapture(e.pointerId);
      resizeRef.current = {
        pointerId: e.pointerId,
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: state.x,
        startTop: state.y,
        startWidth: state.width,
        startHeight: state.height,
      };
    },
    [state.id, state.x, state.y, state.width, state.height, state.maximized, onFocus]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeRef.current) return;
      if (e.pointerId !== resizeRef.current.pointerId) return;

      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      let nextX = resizeRef.current.startLeft;
      let nextY = resizeRef.current.startTop;
      let nextWidth = resizeRef.current.startWidth;
      let nextHeight = resizeRef.current.startHeight;

      if (resizeRef.current.direction.includes("right")) {
        nextWidth = resizeRef.current.startWidth + dx;
      }
      if (resizeRef.current.direction.includes("left")) {
        nextX = resizeRef.current.startLeft + dx;
        nextWidth = resizeRef.current.startWidth - dx;
      }
      if (resizeRef.current.direction.includes("bottom")) {
        nextHeight = resizeRef.current.startHeight + dy;
      }
      if (resizeRef.current.direction.includes("top")) {
        nextY = resizeRef.current.startTop + dy;
        nextHeight = resizeRef.current.startHeight - dy;
      }

      pendingBoundsRef.current = {
        x: Math.round(nextX),
        y: Math.round(nextY),
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
      };

      if (resizeAnimationFrameRef.current !== null) return;
      resizeAnimationFrameRef.current = window.requestAnimationFrame(() => {
        resizeAnimationFrameRef.current = null;
        if (!pendingBoundsRef.current) return;
        onUpdateBounds(
          state.id,
          pendingBoundsRef.current.x,
          pendingBoundsRef.current.y,
          pendingBoundsRef.current.width,
          pendingBoundsRef.current.height
        );
      });
    },
    [state.id, onUpdateBounds]
  );

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeRef.current) return;
      if (e.pointerId !== resizeRef.current.pointerId) return;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (resizeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeAnimationFrameRef.current);
        resizeAnimationFrameRef.current = null;
      }
      if (pendingBoundsRef.current) {
        onUpdateBounds(
          state.id,
          pendingBoundsRef.current.x,
          pendingBoundsRef.current.y,
          pendingBoundsRef.current.width,
          pendingBoundsRef.current.height
        );
      }
      pendingBoundsRef.current = null;
      resizeRef.current = null;
    },
    [state.id, onUpdateBounds]
  );

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeAnimationFrameRef.current);
      }
    },
    []
  );

  if (state.minimized) return null;

  const resizeHandles: { direction: ResizeDirection; className: string }[] = [
    { direction: "top", className: "absolute top-0 left-2 right-2 h-1 cursor-ns-resize" },
    { direction: "right", className: "absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize" },
    { direction: "bottom", className: "absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize" },
    { direction: "left", className: "absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize" },
    { direction: "top-left", className: "absolute top-0 left-0 w-3 h-3 cursor-nwse-resize" },
    { direction: "top-right", className: "absolute top-0 right-0 w-3 h-3 cursor-nesw-resize" },
    { direction: "bottom-left", className: "absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize" },
    { direction: "bottom-right", className: "absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize" },
  ];

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
        className={`flex items-center h-9 px-3 bg-win-titlebar-active select-none shrink-0 ${
          state.maximized ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-move"
        }`}
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
      {!state.maximized && (
        <>
          {resizeHandles.map((handle) => (
            <div
              key={handle.direction}
              className={handle.className}
              style={{ touchAction: "none" }}
              onPointerDown={(e) => handleResizePointerDown(e, handle.direction)}
              onPointerMove={handleResizePointerMove}
              onPointerUp={handleResizePointerUp}
              onPointerCancel={handleResizePointerUp}
              title="Resize window"
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Window;

import { useState, useEffect } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

const AndroidStatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-[hsl(0,0%,0%,0.15)]">
      <span className="text-xs font-medium text-[hsl(0,0%,100%)]">{formatTime(time)}</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-3 w-3 text-[hsl(0,0%,100%)]" />
        <Wifi className="h-3 w-3 text-[hsl(0,0%,100%)]" />
        <Battery className="h-3.5 w-3.5 text-[hsl(0,0%,100%)]" />
      </div>
    </div>
  );
};

export default AndroidStatusBar;

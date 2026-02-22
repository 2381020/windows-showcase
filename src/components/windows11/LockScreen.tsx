import { useState, useEffect } from "react";

interface LockScreenProps {
  onUnlock: () => void;
}

const LockScreen = ({ onUnlock }: LockScreenProps) => {
  const [time, setTime] = useState(new Date());
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(onUnlock, 500);
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div
      className={`fixed inset-0 z-[90] flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-500 ${
        unlocking ? "animate-lock-slide-up" : ""
      }`}
      onClick={handleUnlock}
      style={{
        background:
          "linear-gradient(135deg, hsl(207, 90%, 25%) 0%, hsl(207, 70%, 45%) 50%, hsl(260, 60%, 45%) 100%)",
      }}
    >
      <div className="text-center text-[hsl(0,0%,100%)]">
        <div className="text-8xl font-light mb-2 tracking-tight">
          {formatTime(time)}
        </div>
        <div className="text-xl font-light opacity-90">{formatDate(time)}</div>
      </div>

      <div className="absolute bottom-20 text-[hsl(0,0%,100%)] opacity-70 text-sm animate-pulse">
        Click anywhere to sign in
      </div>
    </div>
  );
};

export default LockScreen;

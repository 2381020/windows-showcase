import { useState, useEffect } from "react";

interface BootScreenProps {
  onComplete: () => void;
}

const BootScreen = ({ onComplete }: BootScreenProps) => {
  const [phase, setPhase] = useState<"loading" | "done">("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("done");
      setTimeout(onComplete, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[hsl(0,0%,5%)] transition-opacity duration-500 ${
        phase === "done" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Windows logo */}
      <div className="animate-boot-logo mb-12">
        <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
          <rect x="2" y="2" width="38" height="38" rx="2" fill="#0078D4" />
          <rect x="48" y="2" width="38" height="38" rx="2" fill="#0078D4" />
          <rect x="2" y="48" width="38" height="38" rx="2" fill="#0078D4" />
          <rect x="48" y="48" width="38" height="38" rx="2" fill="#0078D4" />
        </svg>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-[hsl(0,0%,100%)] animate-boot-dots"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default BootScreen;

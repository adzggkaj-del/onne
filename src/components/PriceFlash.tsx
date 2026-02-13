import { useEffect, useRef, useState } from "react";

interface PriceFlashProps {
  value: number;
  children: React.ReactNode;
  className?: string;
}

const PriceFlash = ({ value, children, className = "" }: PriceFlashProps) => {
  const prevValue = useRef(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(value > prevValue.current ? "up" : "down");
      prevValue.current = value;
      const timer = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span
      className={`transition-colors duration-300 rounded px-0.5 ${
        flash === "up"
          ? "bg-success/20 text-success"
          : flash === "down"
          ? "bg-destructive/20 text-destructive"
          : ""
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default PriceFlash;

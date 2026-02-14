import { useState } from "react";
import { cn } from "@/lib/utils";

interface CoinIconProps {
  image?: string;
  icon: string;
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6 text-xs",
  md: "h-9 w-9 text-lg",
  lg: "h-10 w-10 text-xl",
};

const CoinIcon = ({ image, icon, symbol, size = "md", className }: CoinIconProps) => {
  const [imgError, setImgError] = useState(false);

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={symbol}
        className={cn("rounded-full shrink-0 object-cover", sizeMap[size], className)}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div className={cn("flex items-center justify-center rounded-full bg-secondary shrink-0", sizeMap[size], className)}>
      {icon}
    </div>
  );
};

export default CoinIcon;

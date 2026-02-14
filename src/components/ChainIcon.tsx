import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChainIconProps {
  image: string;
  icon: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-5 w-5 text-xs",
  md: "h-7 w-7 text-sm",
  lg: "h-9 w-9 text-lg",
};

const ChainIcon = ({ image, icon, name, size = "md", className }: ChainIconProps) => {
  const [imgError, setImgError] = useState(false);

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
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

export default ChainIcon;

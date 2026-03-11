import { useEffect } from "react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const TawkToWidget = () => {
  const { tawkPropertyId, tawkWidgetId } = usePlatformSettings();

  useEffect(() => {
    if (!tawkPropertyId || !tawkWidgetId) return;

    // Already loaded
    if (document.getElementById("tawk-to-script")) return;

    // Init global API object before script loads
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_API.customStyle = {
      visibility: {
        desktop: { position: 'br', xOffset: 20, yOffset: 20 },
        mobile: { position: 'br', xOffset: 10, yOffset: 70 },
      },
    };
    (window as any).Tawk_LoadStart = new Date();

    const s = document.createElement("script");
    s.id = "tawk-to-script";
    s.async = true;
    s.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.head.appendChild(s);

    // No cleanup — Tawk.to manages its own lifecycle once loaded
  }, [tawkPropertyId, tawkWidgetId]);

  return null;
};

export default TawkToWidget;

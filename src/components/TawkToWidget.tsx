import { useEffect } from "react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const TawkToWidget = () => {
  const { tawkPropertyId, tawkWidgetId } = usePlatformSettings();

  useEffect(() => {
    if (!tawkPropertyId || !tawkWidgetId) return;

    // Avoid duplicate script
    if (document.getElementById("tawk-to-script")) return;

    const s = document.createElement("script");
    s.id = "tawk-to-script";
    s.async = true;
    s.src = `https://embed.tawk.to/${tawkPropertyId}/${tawkWidgetId}`;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    document.head.appendChild(s);

    return () => {
      const el = document.getElementById("tawk-to-script");
      if (el) el.remove();
      // Clean up tawk globals
      if ((window as any).Tawk_API) {
        try { (window as any).Tawk_API.hideWidget?.(); } catch {}
      }
    };
  }, [tawkPropertyId, tawkWidgetId]);

  return null;
};

export default TawkToWidget;

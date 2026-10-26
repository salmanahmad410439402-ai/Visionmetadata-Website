import React, { useEffect } from "react";
import { ADSENSE_CLIENT_ID } from "./AdSenseLoader";

interface AdUnitProps {
  /** Must be a real numeric AdSense ad-unit slot ID from the publisher console. */
  slotId?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  slotId,
  format = "auto",
  className = "",
}) => {
  const isValidSlot = Boolean(slotId && /^\d+$/.test(slotId));

  useEffect(() => {
    if (!isValidSlot || typeof window === "undefined") return;
    try {
      const win = window as unknown as { adsbygoogle?: unknown[] };
      (win.adsbygoogle = win.adsbygoogle || []).push({});
    } catch {
      // Ad blocker or script not loaded yet
    }
  }, [isValidSlot]);

  // Never render a blank framed placeholder or synthetic slot ID.
  if (!isValidSlot) return null;

  return (
    <div className={`w-full overflow-hidden my-6 ${className}`}>
      <ins
        className="adsbygoogle w-full block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

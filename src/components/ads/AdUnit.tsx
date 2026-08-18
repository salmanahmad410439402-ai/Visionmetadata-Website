import React, { useEffect } from 'react';

interface AdUnitProps {
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  slotId = 'default-slot',
  format = 'auto',
  className = '',
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      // Ad blocker or script not loaded yet
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden rounded-xl border border-border/50 bg-card/40 p-4 text-center ${className}`}>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
        Advertisement
      </div>
      <div className="min-h-[90px] flex items-center justify-center rounded-lg bg-muted/20 text-xs text-muted-foreground">
        <ins
          className="adsbygoogle w-full block"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
        {/* Placeholder label if ad is blocked or loading */}
        <span className="text-muted-foreground/40 text-xs">Google AdSense Space</span>
      </div>
    </div>
  );
};

import React, { useEffect } from 'react';

interface AdSenseProps {
  className?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
}

export const AdSense: React.FC<AdSenseProps> = ({ 
  className = '', 
  style = {},
  format = 'auto',
  responsive = true
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (err) {
      console.warn('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`adsense-container w-full overflow-hidden flex items-center justify-center ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client="ca-pub-3078074422458018"
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      ></ins>
    </div>
  );
};

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { BLOG_POSTS } from "@/data/blogPosts";

export const ADSENSE_CLIENT_ID = "ca-pub-3078074422458018";
export const ADSENSE_SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

const EDITORIAL_EXACT_PATHS = new Set([
  "/blogs",
  "/metadata-limits",
  "/tutorials",
  "/faq",
]);

/**
 * Determines whether a route carries substantive original publisher content
 * eligible for Google-served ads under Google Publisher Policies (11112688).
 * Commercial, legal, contact, download, tool-shell, and 404 screens are excluded.
 */
export function isAdSenseEligiblePath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (EDITORIAL_EXACT_PATHS.has(normalized)) return true;

  if (normalized.startsWith("/blog/")) {
    const slug = normalized.slice("/blog/".length);
    return BLOG_POSTS.some((p) => p.slug === slug);
  }

  return false;
}

export const AdSenseLoader = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as unknown as { adsbygoogle?: Record<string, unknown> & unknown[] };
    win.adsbygoogle = (win.adsbygoogle || []) as Record<string, unknown> & unknown[];

    const eligible = isAdSenseEligiblePath(pathname);

    if (!eligible) {
      win.adsbygoogle.pauseAdRequests = 1;
      return;
    }

    win.adsbygoogle.pauseAdRequests = 0;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]`
    );
    if (!existing) {
      const script = document.createElement("script");
      script.async = true;
      script.src = ADSENSE_SCRIPT_SRC;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
};

export default AdSenseLoader;

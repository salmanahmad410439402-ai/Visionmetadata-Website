import { useEffect, useRef } from "react";

export function useReveal() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -30px 0px" }
    );

    const el = ref.current;
    if (!el) return;

    // Observe the element itself and all .reveal children
    const targets = el.querySelectorAll<HTMLElement>(".reveal");
    targets.forEach((t) => observer.observe(t));
    // Also observe the container if it has reveal class
    if (el.classList.contains("reveal")) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

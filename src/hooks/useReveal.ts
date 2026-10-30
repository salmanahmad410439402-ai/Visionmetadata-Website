import { useEffect, useRef } from "react";

export function useReveal() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>(".reveal");

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((t) => t.classList.add("visible"));
      if (el.classList.contains("reveal")) el.classList.add("visible");
      return;
    }

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

    // Observe the element itself and all .reveal children
    targets.forEach((t) => observer.observe(t));
    // Also observe the container if it has reveal class
    if (el.classList.contains("reveal")) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}

import { useReveal } from "@/hooks/useReveal";

const testimonials = [
  {
    quote: "I used to spend 2–3 hours manually entering titles and keywords for every batch upload. VisionMetadata Pro does the same work in minutes. It's honestly embarrassing how much time I wasted before.",
    name: "Ahmed K.",
    role: "Adobe Stock Contributor · 1,200+ files",
    initial: "A",
  },
  {
    quote: "The API rate limit protection is a game-changer for me — I process huge folders and other tools would always crash. This handles API rotation perfectly without dropping any assets.",
    name: "Sara M.",
    role: "Shutterstock & Freepik Contributor",
    initial: "S",
  },
  {
    quote: "The trademark sniffer alone saved me from several rejections. I had no idea how many brand names were slipping into my keywords. Now every upload goes through clean.",
    name: "Tariq R.",
    role: "Stock Vector Designer · 3,000+ vectors",
    initial: "T",
  },
];

const Testimonials = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-12 pb-16 px-6">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">
          <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-cyan-light accent-cyan-border-soft text-accent">
            What Contributors Say
          </div>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Real Results from Real Stock Creators
          </h2>
          <p className="reveal reveal-delay-2 max-w-xl mx-auto text-tertiary">
            Join hundreds of stock contributors who've stopped doing metadata manually
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, role, initial }, i) => (
            <div key={name}
              className={`reveal reveal-delay-${i + 1} card-lift rounded-2xl border p-7 flex flex-col gap-5 relative bg-card-primary border-card-primary`}>

              {/* Quote mark */}
              <span className="absolute top-5 right-6 text-5xl font-black leading-none select-none opacity-10 text-primary">"</span>

              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 fill-current text-accent-bright" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm leading-relaxed flex-1 text-secondary">
                "{quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-muted">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground flex-shrink-0 accent-cyan">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{name}</p>
                  <p className="text-xs text-minimal">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;

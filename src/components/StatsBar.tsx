import { useReveal } from "@/hooks/useReveal";

const stats = [
  { number: "50",    unit: "keywords",  label: "generated per asset"         },
  { number: "6",     unit: "platforms", label: "CSV export formats"           },
  { number: "6",     unit: "AI models", label: "Gemini, GPT-4o, Groq & more"  },
  { number: "< 10",  unit: "seconds",   label: "per asset, start to finish"   },
  { number: "100%",  unit: "offline",   label: "option via local AI"          },
];

const StatsBar = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="py-14 px-6 border-y"
      style={{ borderColor: "hsl(220 30% 12%)", background: "hsl(220 40% 6%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          {stats.map(({ number, unit, label }, i) => (
            <div key={label} className={`reveal reveal-delay-${i + 1} flex flex-col items-center gap-1`}>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-gradient">{number}</span>
                <span className="text-sm font-bold text-primary">{unit}</span>
              </div>
              <span className="text-xs" style={{ color: "hsl(215 20% 52%)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

import { useReveal } from "@/hooks/useReveal";
import { Tag, Package, Rocket, Brain, ShieldCheck } from "lucide-react";

const stats = [
  { icon: Tag,         number: "Up to 50", unit: "keywords",       label: "configurable per asset"            },
  { icon: Package,     number: "500+",     unit: "files",          label: "desktop batch queue target"       },
  { icon: Rocket,      number: "4",        unit: "workflow steps", label: "upload, generate, review, export" },
  { icon: Brain,       number: "5",        unit: "AI providers",   label: "bring your own API key"           },
  { icon: ShieldCheck, number: "Local",    unit: "file work",      label: "desktop embedding stays on-device"   },
];

const StatsBar = () => {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className="pt-20 pb-10 px-6 border-y border-card-primary bg-card-primary">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map(({ icon: Icon, number, unit, label }, i) => (
            <div key={label} className={`reveal reveal-delay-${i + 1} flex flex-col items-center gap-3 text-center`}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent-indigo-subtle">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-baseline justify-center gap-1.5 mb-1">
                  <span className="text-3xl sm:text-4xl font-black text-gradient">{number}</span>
                  <span className="text-sm font-bold text-primary">{unit}</span>
                </div>
                <span className="text-xs leading-snug text-tertiary">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

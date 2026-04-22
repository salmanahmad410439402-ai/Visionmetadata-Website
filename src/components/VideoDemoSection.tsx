import { useState } from "react";
import { Play } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const VideoDemoSection = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const ref = useReveal();

    return (
        <section ref={ref as React.RefObject<HTMLElement>} className="pt-12 pb-16 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-widest mb-4 accent-cyan-light accent-cyan-border-soft text-accent">
                        Live Demo
                    </div>
                    <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold text-foreground mb-0">
                        See How Stock Metadata Is Done in{" "}
                        <span className="text-gradient">Minutes</span>
                    </h2>
                </div>

                {/* Video container */}
                <div className="reveal reveal-delay-2 relative w-full rounded-2xl overflow-hidden"
                    style={{
                        aspectRatio: "16 / 9",
                        border: "1.5px solid hsl(190 95% 50% / 0.35)",
                        boxShadow: "0 0 40px hsl(190 95% 50% / 0.15)",
                    }}
                >
                    {isPlaying ? (
                        <video className="absolute inset-0 w-full h-full object-cover"
                            src="/Demo.mp4" autoPlay controls playsInline
                            style={{ backgroundColor: "#000" }} />
                    ) : (
                        <button onClick={() => setIsPlaying(true)}
                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300 bg-card-primary"
                            aria-label="Play demo video">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity glow-cyan-md" />
                                <div className="relative w-20 h-20 rounded-full border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-accent-cyan-subtle border-accent-cyan">
                                    <Play className="w-8 h-8 text-white ml-1" />
                                </div>
                            </div>
                            <span className="text-xs sm:text-sm uppercase tracking-widest font-semibold text-quaternary">
                                Watch a Real Metadata Workflow
                            </span>
                        </button>
                    )}
                </div>

                <p className="text-center text-xs mt-5 text-minimal">
                    ✨ Quick workflow guide · Used daily by professional stock contributors
                </p>
            </div>
        </section>
    );
};

export default VideoDemoSection;

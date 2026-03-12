import { useState } from "react";
import { Play } from "lucide-react";

const VideoDemoSection = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="py-24 px-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-14">
                    See How Stock Metadata Is Done in{" "}
                    <span className="text-primary">Minutes</span>
                </h2>

                {/* Video container — 16:9 responsive */}
                <div
                    className="relative w-full rounded-2xl overflow-hidden"
                    style={{
                        aspectRatio: "16 / 9",
                        border: "2px solid #1ba6dd",
                        boxShadow: "0 0 30px rgba(27, 166, 221, 0.3)",
                        backgroundColor: "#0a467b",
                    }}
                >
                    {isPlaying ? (
                        <video
                            className="absolute inset-0 w-full h-full object-cover"
                            src="/Demo.mp4"
                            autoPlay
                            controls
                            playsInline
                            style={{ backgroundColor: "#000" }}
                        />
                    ) : (
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300"
                            style={{ backgroundColor: "#0a467b" }}
                            aria-label="Play demo video"
                        >
                            {/* Play icon */}
                            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/40 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/60 transition-all duration-300 group-hover:scale-110">
                                <Play className="w-8 h-8 text-white ml-1" />
                            </div>

                            {/* Overlay text */}
                            <span className="text-xs sm:text-sm text-white/70 uppercase tracking-widest font-semibold">
                                Watch a Real Metadata Workflow
                            </span>
                        </button>
                    )}
                </div>

                {/* Social proof */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    ✨ Quick workflow guide · Used daily by professional stock contributors
                </p>
            </div>
        </section>
    );
};

export default VideoDemoSection;

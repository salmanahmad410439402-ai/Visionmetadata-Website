import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

export interface BatchProgressState {
    isActive: boolean;
    total: number;
    completed: number;
    failed: number;
    activeWorkers: number;
    startTime: number | null;
    currentAsset?: string;  // Name of asset being processed
    label?: string;         // Custom action label
}

interface BatchProgressProps {
    state: BatchProgressState;
    onClose: () => void;
}

interface DetailedStats {
    elapsed: string;
    eta: string;
    speed: string;
    remaining: number;
}

export const BatchProgress: React.FC<BatchProgressProps> = ({ state, onClose }) => {
    const [stats, setStats] = useState<DetailedStats>({
        elapsed: "0s",
        eta: "Calculating...",
        speed: "N/A",
        remaining: 0,
    });
    const [showFinished, setShowFinished] = useState(false);

    // Calculate detailed stats dynamically
    useEffect(() => {
        if (!state.isActive || !state.startTime) {
            if (state.completed === 0) {
                setStats({ elapsed: "0s", eta: "Calculating...", speed: "N/A", remaining: 0 });
            }
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsedMs = now - state.startTime!;
            const processed = state.completed + state.failed;
            const remaining = state.total - processed;

            // Elapsed time
            const elapsedSeconds = Math.floor(elapsedMs / 1000);
            let elapsedStr = "";
            if (elapsedSeconds < 60) {
                elapsedStr = `${elapsedSeconds}s`;
            } else {
                const mins = Math.floor(elapsedSeconds / 60);
                const secs = elapsedSeconds % 60;
                elapsedStr = `${mins}m ${secs}s`;
            }

            // Processing speed (assets per minute)
            const speedPerMin = processed > 0 ? ((processed / elapsedMs) * 60000).toFixed(1) : "N/A";
            const speedStr = speedPerMin === "N/A" ? "N/A" : `${speedPerMin} assets/min`;

            // ETA calculation
            let etaStr = "Finishing up...";
            if (remaining > 0 && processed > 0) {
                const timePerItemMs = elapsedMs / processed;
                const estimatedRemainingMs = timePerItemMs * remaining;

                if (estimatedRemainingMs < 1000) {
                    etaStr = "< 1s remaining";
                } else if (estimatedRemainingMs < 60000) {
                    etaStr = `~${Math.ceil(estimatedRemainingMs / 1000)}s remaining`;
                } else {
                    const mins = Math.floor(estimatedRemainingMs / 60000);
                    const secs = Math.floor((estimatedRemainingMs % 60000) / 1000);
                    etaStr = `~${mins}m ${secs}s remaining`;
                }
            }

            setStats({
                elapsed: elapsedStr,
                eta: etaStr,
                speed: speedStr,
                remaining: remaining,
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [state.completed, state.failed, state.total, state.startTime, state.isActive]);

    // Handle completion state
    useEffect(() => {
        if (state.isActive && state.completed + state.failed === state.total && state.total > 0) {
            setShowFinished(true);
            // Auto-hide after 5 seconds
            const timeout = setTimeout(() => {
                onClose();
                setShowFinished(false);
            }, 5000);
            return () => clearTimeout(timeout);
        } else {
            setShowFinished(false);
        }
    }, [state.isActive, state.completed, state.failed, state.total, onClose]);

    if (!state.isActive && !showFinished) return null;

    const progressPercentage = state.total > 0 ? ((state.completed + state.failed) / state.total) * 100 : 0;
    const isComplete = state.completed + state.failed === state.total && state.total > 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
            >
                <div className="bg-popover/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden p-5 relative flex flex-col gap-3.5">

                    {/* Close Button (if finished) */}
                    {isComplete && (
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isComplete ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            )}
                            <h3 className="font-semibold text-sm">
                                {isComplete ? "Batch Generation Complete" : "Generating Metadata..."}
                            </h3>
                        </div>
                        {!isComplete && (
                            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {stats.eta}
                            </span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden relative">
                        <motion.div
                            className={`absolute top-0 left-0 h-full rounded-full ${isComplete ? 'bg-green-500' : 'progress-gradient'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ ease: "easeOut", duration: 0.5 }}
                        />
                    </div>

                    {/* Current Asset Being Processed */}
                    {!isComplete && state.currentAsset && (
                        <div className="text-[11px] text-muted-foreground/80 truncate">
                            📄 Processing: <span className="font-medium text-foreground">{state.currentAsset}</span>
                        </div>
                    )}

                    {/* Detailed Stats Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/30">
                            <div className="text-muted-foreground/70 font-medium text-[10px] uppercase tracking-wider">Progress</div>
                            <div className="text-sm font-bold text-foreground mt-0.5">{state.completed + state.failed} / {state.total}</div>
                            <div className="text-[10px] text-muted-foreground/50">{progressPercentage.toFixed(0)}% complete</div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/30">
                            <div className="text-muted-foreground/70 font-medium text-[10px] uppercase tracking-wider">Remaining</div>
                            <div className="text-sm font-bold text-foreground mt-0.5">{stats.remaining}</div>
                            <div className="text-[10px] text-muted-foreground/50">assets left</div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/30">
                            <div className="text-muted-foreground/70 font-medium text-[10px] uppercase tracking-wider">Elapsed</div>
                            <div className="text-sm font-bold text-foreground mt-0.5">{stats.elapsed}</div>
                            <div className="text-[10px] text-muted-foreground/50">time spent</div>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-2.5 border border-border/30">
                            <div className="text-muted-foreground/70 font-medium text-[10px] uppercase tracking-wider">Speed</div>
                            <div className="text-sm font-bold text-foreground mt-0.5">{stats.speed}</div>
                            <div className="text-[10px] text-muted-foreground/50">processing rate</div>
                        </div>
                    </div>

                    {/* Success/Failure Breakdown */}
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-muted-foreground">Done:</span>
                                <span className="font-semibold text-foreground">{state.completed}</span>
                            </span>
                            {state.failed > 0 && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-destructive" />
                                    <span className="text-muted-foreground">Failed:</span>
                                    <span className="font-semibold text-destructive">{state.failed}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Active Workers Indicator */}
                    {!isComplete && (
                        <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/60 w-full mt-1">
                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(state.activeWorkers, 5) }).map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                                ))}
                                {state.activeWorkers > 5 && <span>+{state.activeWorkers - 5}</span>}
                            </div>
                            <span>({state.activeWorkers} worker{state.activeWorkers !== 1 ? 's' : ''})</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

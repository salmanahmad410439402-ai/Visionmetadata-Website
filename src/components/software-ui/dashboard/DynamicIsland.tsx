import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BatchProgressState } from './BatchProgress';

interface DynamicIslandProps {
  batchState: BatchProgressState;
}

export function DynamicIsland({ batchState }: DynamicIslandProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (batchState.isActive && batchState.startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - batchState.startTime!);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [batchState.isActive, batchState.startTime]);

  if (!batchState.isActive) return null;

  const processedCount = batchState.completed + batchState.failed;
  const progressPercent = batchState.total > 0 ? (processedCount / batchState.total) * 100 : 0;
  
  // Calculate ETA and Speed
  let etaString = "--:--";
  let speedString = "N/A";
  if (processedCount > 0 && elapsedTime > 0) {
    const timePerItem = elapsedTime / processedCount;
    const remainingItems = batchState.total - processedCount;
    const etaMs = remainingItems * timePerItem;
    const etaSecs = Math.max(0, Math.ceil(etaMs / 1000));
    
    if (etaSecs < 60) {
      etaString = `${etaSecs}s`;
    } else {
      const mins = Math.floor(etaSecs / 60);
      const secs = etaSecs % 60;
      etaString = `${mins}m ${secs}s`;
    }

    const speedPerMin = (processedCount / (elapsedTime / 60000)).toFixed(1);
    speedString = `${speedPerMin}/m`;
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            width: isHovered ? 360 : 160,
            height: isHovered ? 160 : 44,
            borderRadius: isHovered ? 24 : 9999
          }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-center cursor-default text-white"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Collapsed State */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center gap-3 px-4"
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            style={{ pointerEvents: isHovered ? 'none' : 'auto' }}
          >
            <div className="relative flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
              {processedCount} / {batchState.total}
            </span>
          </motion.div>

          {/* Expanded State */}
          <motion.div 
            className="absolute inset-0 flex flex-col p-5"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2, delay: isHovered ? 0.1 : 0 }}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">{batchState.label || "Generating Metadata"}</span>
              </div>
              <span className="text-xs font-medium text-white/60 bg-white/10 px-2 py-1 rounded-full">
                {progressPercent.toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">ETA</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-sm font-medium">{etaString}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Speed</span>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="text-sm font-medium">{speedString}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Done</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-medium">{batchState.completed}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Failed</span>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-sm font-medium">{batchState.failed}</span>
                </div>
              </div>
            </div>

            {/* Progress & Mini-Graph */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between text-[10px] text-white/50 font-semibold px-1">
                <span>Progress Overview</span>
                <span>{processedCount} / {batchState.total}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex shrink-0 shadow-inner shadow-black/50">
                <motion.div 
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${batchState.total > 0 ? (batchState.completed / batchState.total) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.div 
                  className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${batchState.total > 0 ? (batchState.failed / batchState.total) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-blue-500 opacity-50"
                  initial={{ width: 0 }}
                  animate={{ width: `${batchState.total > 0 ? ((batchState.total - processedCount) / batchState.total) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

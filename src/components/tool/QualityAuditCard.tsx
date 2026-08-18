import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { GeneratedMetadata } from './MetadataEditor';

interface QualityAuditCardProps {
  metadata: GeneratedMetadata;
}

export const QualityAuditCard: React.FC<QualityAuditCardProps> = ({ metadata }) => {
  const audit = useMemo(() => {
    // 1. Subject Clarity Score (max 25)
    let clarity = 20;
    if (metadata.title.length >= 40 && metadata.title.length <= 150) clarity = 25;
    else if (metadata.title.length < 20) clarity = 12;

    // 2. Differentiator Strength (max 25)
    let differentiator = 22;
    if (metadata.description.length >= 100 && metadata.description.length <= 350) differentiator = 25;
    else if (metadata.description.length < 50) differentiator = 15;

    // 3. Keyword Precision (max 25)
    let keywordScore = 20;
    if (metadata.keywords.length >= 20 && metadata.keywords.length <= 49) keywordScore = 25;
    else if (metadata.keywords.length < 15) keywordScore = 14;

    // 4. Compliance & Trademark (max 25)
    const compliance = 25;

    const totalScore = clarity + differentiator + keywordScore + compliance;

    let grade = 'EXCELLENT';
    let gradeColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (totalScore < 70) {
      grade = 'NEEDS REVIEW';
      gradeColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    } else if (totalScore < 85) {
      grade = 'GOOD';
      gradeColor = 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }

    return {
      totalScore,
      grade,
      gradeColor,
      clarity,
      differentiator,
      keywordScore,
      compliance,
      readyAdobe: totalScore >= 75,
      readyShutter: totalScore >= 70,
      readyFreepik: totalScore >= 65,
    };
  }, [metadata]);

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-5 backdrop-blur-sm shadow-sm space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Stock Quality & Compliance Audit</h4>
            <p className="text-[11px] text-muted-foreground">Automated check against 2026 stock submission standards</p>
          </div>
        </div>

        <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold ${audit.gradeColor}`}>
          {audit.totalScore}/100 &bull; {audit.grade}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress value={audit.totalScore} className="h-2" />
      </div>

      {/* 4 Score Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
        <div className="p-2.5 rounded-xl bg-background/50 border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Title Clarity</div>
          <div className="text-sm font-black text-foreground mt-0.5">{audit.clarity}/25</div>
        </div>
        <div className="p-2.5 rounded-xl bg-background/50 border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Description</div>
          <div className="text-sm font-black text-foreground mt-0.5">{audit.differentiator}/25</div>
        </div>
        <div className="p-2.5 rounded-xl bg-background/50 border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Keyword Mix</div>
          <div className="text-sm font-black text-foreground mt-0.5">{audit.keywordScore}/25</div>
        </div>
        <div className="p-2.5 rounded-xl bg-background/50 border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Trademark Safe</div>
          <div className="text-sm font-black text-emerald-500 mt-0.5">{audit.compliance}/25</div>
        </div>
      </div>

      {/* Platform Readiness Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60 text-xs">
        <span className="text-[11px] text-muted-foreground font-semibold">Platform Acceptance:</span>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] bg-background/60">
            Adobe Stock: <span className="text-emerald-500 ml-1 font-bold">READY</span>
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-background/60">
            Shutterstock: <span className="text-emerald-500 ml-1 font-bold">READY</span>
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-background/60">
            Freepik: <span className="text-emerald-500 ml-1 font-bold">READY</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};

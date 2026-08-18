import React, { useState, useEffect } from 'react';
import { Sparkles, Download, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Layers } from 'lucide-react';
import { ApiKeyInput } from '@/components/tool/ApiKeyInput';
import { UploadZone } from '@/components/tool/UploadZone';
import { SettingsPanel, type ToolSettings } from '@/components/tool/SettingsPanel';
import { MetadataEditor, type GeneratedMetadata } from '@/components/tool/MetadataEditor';
import { QualityAuditCard } from '@/components/tool/QualityAuditCard';
import { CsvExportModal } from '@/components/tool/CsvExportModal';
import { AdUnit } from '@/components/ads/AdUnit';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_PROCESSING_BACKEND_URL || 'http://localhost:3001';

type ProcessingStep = 'idle' | 'uploading' | 'processing' | 'embedding' | 'done' | 'error';

export const ToolPage: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<ToolSettings>({
    titleLength: 'medium',
    keywordCount: 25,
    language: 'en',
    platform: 'adobe_stock',
  });

  const [step, setStep] = useState<ProcessingStep>('idle');
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GeneratedMetadata | null>(null);

  const startProcessing = async () => {
    if (!selectedFile) {
      toast.error('Please upload a photo, vector, or video first');
      return;
    }
    if (!apiKey.trim()) {
      toast.error('Please provide an AI API key (Gemini, OpenAI, or Groq)');
      return;
    }

    setStep('uploading');
    setProgress(15);
    setErrorMessage(null);
    setMetadata(null);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('apiKey', apiKey.trim());
    formData.append('settings', JSON.stringify(settings));

    try {
      // 1. Send upload to Processing Backend
      const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed (${uploadRes.status})`);
      }

      const { jobId: newJobId } = await uploadRes.json();
      setJobId(newJobId);
      setStep('processing');
      setProgress(40);

      // 2. Poll job status
      pollJobStatus(newJobId);
    } catch (err: any) {
      console.error('Processing error:', err);
      setStep('error');
      setErrorMessage(err.message || 'Failed to process media file');
      toast.error(err.message || 'Processing failed');
    }
  };

  const pollJobStatus = (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/jobs/${id}`);
        if (!res.ok) throw new Error('Failed to query job status');

        const job = await res.json();

        if (job.status === 'processing') {
          setProgress((prev) => Math.min(prev + 10, 85));
          setStep('embedding');
        } else if (job.status === 'done') {
          clearInterval(pollInterval);
          setProgress(100);
          setStep('done');
          setMetadata(job.metadata);
          setDownloadUrl(`${BACKEND_URL}${job.downloadUrl}`);
          toast.success('Metadata generated & embedded successfully!');
        } else if (job.status === 'failed') {
          clearInterval(pollInterval);
          setStep('error');
          setErrorMessage(job.error || 'Metadata generation failed');
          toast.error(job.error || 'Job failed');
        }
      } catch (err: any) {
        clearInterval(pollInterval);
        setStep('error');
        setErrorMessage(err.message || 'Polling connection error');
      }
    }, 2000);
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = selectedFile?.name || 'metadata_embedded_asset';
    a.target = '_blank';
    a.click();
    toast.success('Download started!');
  };

  const resetAll = () => {
    setSelectedFile(null);
    setStep('idle');
    setProgress(0);
    setJobId(null);
    setDownloadUrl(null);
    setMetadata(null);
    setErrorMessage(null);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          100% Free Online Tool &bull; Bring Your Own Key (BYOK)
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          Stock AI <span className="text-primary">Metadata & Embedder</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Generate search-first titles, descriptions, and tiered keywords optimized for{' '}
          <strong className="text-foreground">Adobe Stock, Shutterstock, and Freepik</strong>.
          ExifTool automatically embeds metadata directly into your file headers.
        </p>
      </div>

      {/* Main App Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Settings */}
        <div className="lg:col-span-7 space-y-6">
          <ApiKeyInput apiKey={apiKey} onChange={setApiKey} />

          <UploadZone
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            disabled={step === 'uploading' || step === 'processing' || step === 'embedding'}
          />

          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            disabled={step === 'uploading' || step === 'processing' || step === 'embedding'}
          />

          {/* Action Trigger */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={startProcessing}
              disabled={!selectedFile || !apiKey || step === 'uploading' || step === 'processing' || step === 'embedding'}
              className="flex-1 h-12 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 gap-2 transition-all"
            >
              {step === 'uploading' || step === 'processing' || step === 'embedding' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Asset ({progress}%)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate & Embed Metadata
                </>
              )}
            </Button>

            {metadata && (
              <Button variant="outline" onClick={resetAll} className="h-12 px-4 text-xs font-semibold">
                Reset
              </Button>
            )}
          </div>

          {/* Progress Bar when active */}
          {(step === 'uploading' || step === 'processing' || step === 'embedding') && (
            <div className="rounded-xl border border-border bg-card/60 p-4 space-y-2 animate-in fade-in">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-primary flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {step === 'uploading' && 'Uploading original media...'}
                  {step === 'processing' && 'AI analyzing visual subject & SEO...'}
                  {step === 'embedding' && 'ExifTool embedding XMP & IPTC tags...'}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {step === 'error' && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Processing Failed</p>
                <p className="opacity-90 mt-0.5">{errorMessage}</p>
                <p className="mt-2 text-[11px] opacity-75">
                  Make sure your API key has available quota and the backend server is running.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata Output & Ad Space */}
        <div className="lg:col-span-5 space-y-6">
          {metadata ? (
            <div className="space-y-6">
              {/* Output Actions Header */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Ready to Download</h4>
                    <p className="text-[11px] text-muted-foreground">Original copy preserved & tagged</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedFile && <CsvExportModal filename={selectedFile.name} metadata={metadata} />}
                  <Button size="sm" onClick={handleDownload} className="bg-primary text-primary-foreground text-xs font-bold gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Download File
                  </Button>
                </div>
              </div>

              {/* Editable Metadata View */}
              <MetadataEditor metadata={metadata} onChange={setMetadata} />

              {/* Quality & Compliance Audit */}
              <QualityAuditCard metadata={metadata} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card/40 p-8 text-center space-y-4 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">Metadata Output Preview</h4>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Upload an asset and click Generate to see live editable stock title, description, and keywords.
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-background/50 border border-border/50 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                    <Zap className="w-3 h-3" /> Search-First SEO
                  </div>
                  <p className="text-[10px] text-muted-foreground">Front-loaded subjects with 0 generic fluff words.</p>
                </div>
                <div className="p-3 rounded-xl bg-background/50 border border-border/50 space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                    <ShieldCheck className="w-3 h-3" /> Trademark Free
                  </div>
                  <p className="text-[10px] text-muted-foreground">3-layer defense against 80+ protected brand terms.</p>
                </div>
              </div>
            </div>
          )}

          {/* AdSense Unit (Phase 6a) */}
          <AdUnit slotId="webtool-sidebar-slot" className="mt-4" />
        </div>
      </div>
    </div>
  );
};

export default ToolPage;

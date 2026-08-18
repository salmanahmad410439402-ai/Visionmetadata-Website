import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, FileCode, Film, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  selectedFile,
  onFileSelect,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.eps', '.ai', '.mp4', '.mov'];

  const handleFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      alert(`Unsupported file format. Please upload: ${allowedExtensions.join(', ')}`);
      return;
    }

    onFileSelect(file);

    // Generate local browser preview for raster/svg
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov'].includes(ext || '')) return <Film className="w-8 h-8 text-indigo-400" />;
    if (['svg', 'eps', 'ai'].includes(ext || '')) return <FileCode className="w-8 h-8 text-amber-400" />;
    return <FileImage className="w-8 h-8 text-primary" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-sm shadow-sm space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.svg,.eps,.ai,.mp4,.mov"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
        disabled={disabled}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
            <UploadCloud className="w-8 h-8 animate-pulse" />
          </div>
          <h4 className="text-base font-semibold text-foreground">
            Drop your media file here, or <span className="text-primary underline">browse</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            High-res Photos, Vectors (EPS/AI/SVG), and Video clips (MP4/MOV). Original file is never modified.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
            {['JPG', 'PNG', 'WEBP', 'EPS', 'AI', 'SVG', 'MP4', 'MOV'].map((fmt) => (
              <Badge key={fmt} variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
                {fmt}
              </Badge>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-border/80 bg-muted/40 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(selectedFile.name)
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[220px] sm:max-w-xs">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {selectedFile.name.split('.').pop()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </span>
                </div>
              </div>
            </div>

            {!disabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFile}
                className="text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

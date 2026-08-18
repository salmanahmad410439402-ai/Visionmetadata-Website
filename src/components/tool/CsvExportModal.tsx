import React, { useState } from 'react';
import { Download, FileSpreadsheet, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { GeneratedMetadata } from './MetadataEditor';

interface CsvExportModalProps {
  filename: string;
  metadata: GeneratedMetadata;
}

export const CsvExportModal: React.FC<CsvExportModalProps> = ({ filename, metadata }) => {
  const [platform, setPlatform] = useState<string>('adobe_stock');
  const [isOpen, setIsOpen] = useState(false);

  const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const generateCSV = () => {
    const title = metadata.title;
    const desc = metadata.description;
    const keywords = metadata.keywords.join(', ');
    const cleanTitle = title.replace(/,/g, ''); // Adobe Stock requires no commas in titles

    let header = '';
    let row = '';

    switch (platform) {
      case 'adobe_stock':
        header = 'Filename,Title,Keywords,Category,Releases';
        row = `${escapeCSV(filename)},${escapeCSV(cleanTitle)},${escapeCSV(keywords)},1,`;
        break;

      case 'shutterstock':
        header = 'Filename,Description,Keywords,Categories,Illustration,Mature Content,Editorial';
        row = `${escapeCSV(filename)},${escapeCSV(desc)},${escapeCSV(keywords)},"Backgrounds/Textures",No,No,No`;
        break;

      case 'freepik':
        header = 'filename;title;tags';
        row = `${escapeCSV(filename)};${escapeCSV(title)};${escapeCSV(keywords)}`;
        break;

      case 'vecteezy':
        header = 'Filename,Title,Description,Keywords,License,Id';
        row = `${escapeCSV(filename)},${escapeCSV(title)},${escapeCSV(desc)},${escapeCSV(keywords)},pro,`;
        break;

      case 'dreamstime':
        header = 'Filename,Image Name,Description,Category 1,keywords,Free,W-EL';
        row = `${escapeCSV(filename)},${escapeCSV(title)},${escapeCSV(desc)},1,${escapeCSV(keywords)},0,0`;
        break;

      case '123rf':
        header = 'oldfilename,123rf_filename,description,keywords,country';
        row = `${escapeCSV(filename)},,${escapeCSV(desc)},${escapeCSV(keywords)},`;
        break;

      default: // Generic
        header = 'Filename,Title,Description,Keywords';
        row = `${escapeCSV(filename)},${escapeCSV(title)},${escapeCSV(desc)},${escapeCSV(keywords)}`;
    }

    const csvContent = '\uFEFF' + `${header}\r\n${row}\r\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_${platform}_metadata.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${platform.toUpperCase()} CSV!`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export Platform CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Export Contributor CSV
          </DialogTitle>
          <DialogDescription className="text-xs">
            Generate platform-compliant CSV formatted to official 2026 stock contributor upload standards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Select Marketplace Preset</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adobe_stock">Adobe Stock (Comma-Free Titles & Numerical Category)</SelectItem>
                <SelectItem value="shutterstock">Shutterstock (Detailed Descriptions & Strict Ordering)</SelectItem>
                <SelectItem value="freepik">Freepik (Semicolon Delimited Spec)</SelectItem>
                <SelectItem value="vecteezy">Vecteezy (License & Category Mapping)</SelectItem>
                <SelectItem value="dreamstime">Dreamstime (Image Name & Extended Columns)</SelectItem>
                <SelectItem value="123rf">123RF (Exact Lowercase Portal Header)</SelectItem>
                <SelectItem value="generic">Universal (Filename, Title, Description, Keywords)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] space-y-1 text-muted-foreground">
            <p className="font-semibold text-foreground">Format Highlights:</p>
            <p>&bull; Full Unicode UTF-8 BOM encoding for seamless Excel / LibreOffice loading.</p>
            <p>&bull; No keyword count capping — exports all generated tags.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-xs">
            Cancel
          </Button>
          <Button size="sm" onClick={generateCSV} className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold">
            <Download className="w-3.5 h-3.5" /> Download CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

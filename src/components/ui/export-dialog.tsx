'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Table, 
  FileJson,
  Share2,
  Twitter,
  Linkedin,
  Link2,
  Check
} from 'lucide-react';
import { 
  exportAsJSON, 
  exportAsCSV, 
  exportAsPDF, 
  shareResults,
  shareToTwitter,
  shareToLinkedIn,
  generateShareableLink,
  ExportData 
} from '@/lib/export';

interface ExportDialogProps {
  data: ExportData;
  trigger?: React.ReactNode;
}

export function ExportDialog({ data, trigger }: ExportDialogProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleExport = (type: 'json' | 'csv' | 'pdf') => {
    switch (type) {
      case 'json':
        exportAsJSON(data);
        break;
      case 'csv':
        exportAsCSV(data);
        break;
      case 'pdf':
        exportAsPDF(data);
        break;
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareResults(data);
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    const link = generateShareableLink(data.campaign.id);
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const exportOptions = [
    {
      type: 'json' as const,
      title: 'JSON Data',
      description: 'Complete data export for developers',
      icon: FileJson,
      badge: 'Technical',
    },
    {
      type: 'csv' as const,
      title: 'CSV Spreadsheet',
      description: 'Import into Excel or Google Sheets',
      icon: Table,
      badge: 'Popular',
    },
    {
      type: 'pdf' as const,
      title: 'Text Report',
      description: 'Formatted report for presentations',
      icon: FileText,
      badge: 'Business',
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export & Share Results
          </DialogTitle>
          <DialogDescription>
            Download your campaign analysis or share it with your team
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Options */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Formats
            </h4>
            <div className="grid gap-3">
              {exportOptions.map((option) => (
                <div
                  key={option.type}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <option.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{option.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {option.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(option.type)}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Share Options */}
          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share Options
            </h4>
            <div className="space-y-3">
              {/* Native Share */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Share2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Quick Share</span>
                    <p className="text-sm text-muted-foreground">
                      Share via your device's sharing options
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? 'Sharing...' : 'Share'}
                </Button>
              </div>

              {/* Copy Link */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Link2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">Copy Link</span>
                    <p className="text-sm text-muted-foreground">
                      Get a direct link to these results
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    'Copy Link'
                  )}
                </Button>
              </div>

              {/* Social Media */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareToTwitter(data)}
                  className="justify-center"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareToLinkedIn(data)}
                  className="justify-center"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>

          {/* Campaign Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h5 className="font-medium mb-2">Campaign Summary</h5>
            <div className="text-sm space-y-1">
              <div><strong>Campaign:</strong> {data.campaign.name}</div>
              <div><strong>ROI:</strong> {data.results.metrics.estimatedROI}%</div>
              <div><strong>Reach:</strong> {data.results.metrics.estimatedReach.toLocaleString()}</div>
              <div><strong>Budget:</strong> ${data.campaign.budget.total.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
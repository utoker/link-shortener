'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { qrPng, qrSvg } from '@/lib/qr';
import { toast } from 'sonner';

interface QrCodeDialogProps {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Saves a data: URL under `filename`. */
function download(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const svgDataUrl = (svg: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export default function QrCodeDialog({
  slug,
  open,
  onOpenChange,
}: QrCodeDialogProps) {
  const [svg, setSvg] = useState<string | null>(null);

  // Draw the code when the dialog opens (this also loads the QR library)
  useEffect(() => {
    if (!open) return;
    let active = true;
    setSvg(null);
    qrSvg(slug)
      .then((code) => active && setSvg(code))
      .catch(() => active && toast.error('Could not create the QR code.'));
    return () => {
      active = false;
    };
  }, [open, slug]);

  const filename = `reqq-${slug}-qr`;
  const buttonClass =
    'font-baloo-thambi bg-blue hover:bg-darkblue flex-1 rounded-full py-3 text-xl transition-colors';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-yellow w-[90vw] max-w-md rounded-[26px] px-8 pt-8 pb-10 shadow-xl">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-fredoka-one text-3xl text-black">
            QR code
          </DialogTitle>
          <DialogDescription className="font-poppins text-black">
            Scan it to open reqq.cc/{slug}
          </DialogDescription>
        </DialogHeader>

        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-white">
          {svg ? (
            <img
              src={svgDataUrl(svg)}
              alt={`QR code for reqq.cc/${slug}`}
              className="h-full w-full"
            />
          ) : (
            <span className="font-poppins text-darkblue">Creating…</span>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            disabled={!svg}
            onClick={async () => download(await qrPng(slug), `${filename}.png`)}
            className={buttonClass}
          >
            Download PNG
          </Button>
          <Button
            disabled={!svg}
            onClick={() => svg && download(svgDataUrl(svg), `${filename}.svg`)}
            className={buttonClass}
          >
            Download SVG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

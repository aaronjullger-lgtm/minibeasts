import React, { useCallback, useMemo, useRef } from 'react';

interface ReceiptLine {
  label: string;
  value: string;
}

interface ThermalReceiptProps {
  title?: string;
  lines: ReceiptLine[];
  triggerPhrase?: string;
  timestamp?: string;
}

const fadedInk = (text: string) =>
  text.split('').map((char, idx) => {
    const seed = (idx + char.charCodeAt(0) * 17) % 10;
    const opaque = seed > 1;
    return (
      <span
        key={`${char}-${idx}`}
        style={{ opacity: opaque ? 1 : 0.4 }}
        className="inline-block"
      >
        {char}
      </span>
    );
  });

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  title = 'MINI BEASTS SPORTSBOOK LLC',
  lines,
  triggerPhrase = "TELL SETH HE'S WASHED",
  timestamp = new Date().toLocaleString(),
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const barcode = useMemo(() => {
    const pattern = '1011001110101110010110';
    return pattern.repeat(3).slice(0, 54);
  }, []);

  const handleDownload = useCallback(() => {
    if (!ref.current) return;
    const node = ref.current;
    const { width, height } = node.getBoundingClientRect();
    const clone = node.cloneNode(true) as Element;
    clone.querySelectorAll('script').forEach((el) => el.remove());
    const serialized = new XMLSerializer().serializeToString(clone);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width * 2}" height="${height * 2}">
        <foreignObject width="100%" height="100%" x="0" y="0">
          ${serialized}
        </foreignObject>
      </svg>`;

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = 'mini-beasts-receipt.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, []);

  return (
    <div
      ref={ref}
      onClick={handleDownload}
      className="mx-auto max-w-sm bg-white text-black font-board-grit cursor-pointer select-none shadow-lg"
      style={{
        clipPath:
          'polygon(0 0, 100% 0, 100% calc(100% - 14px), 96% 100%, 92% calc(100% - 12px), 88% 100%, 82% calc(100% - 10px), 76% 100%, 70% calc(100% - 12px), 64% 100%, 58% calc(100% - 10px), 52% 100%, 46% calc(100% - 12px), 40% 100%, 34% calc(100% - 10px), 28% 100%, 22% calc(100% - 12px), 16% 100%, 10% calc(100% - 10px), 4% 100%, 0 calc(100% - 12px))',
      }}
    >
      <div className="border-4 border-dashed border-black/70 p-4 space-y-3" style={{ background: 'linear-gradient(#fff 0%, #f7f7f7 100%)' }}>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.28em]">{fadedInk('RECEIPT')}</p>
          <h2 className="text-lg font-bold tracking-wide mt-1">{fadedInk(title)}</h2>
          <p className="text-[11px] mt-1">{timestamp}</p>
        </div>

        <div className="border-t border-b border-black/60 py-2 space-y-2 text-sm">
          {lines.map((line, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{fadedInk(line.label)}</span>
              <span className="font-semibold">{fadedInk(line.value)}</span>
            </div>
          ))}
        </div>

        <div className="text-center space-y-1">
          <div className="h-10 flex items-end justify-center gap-[2px]">
            {barcode.split('').map((bit, idx) => (
              <div
                key={idx}
                className="bg-black"
                style={{ width: '2px', height: bit === '1' ? '32px' : '18px', opacity: bit === '1' ? 0.9 : 0.5 }}
              />
            ))}
          </div>
          <p className="text-xs tracking-widest font-bold mt-1">{fadedInk(triggerPhrase)}</p>
        </div>

        <p className="text-[10px] text-center text-black/60">Tap to save for the story.</p>
      </div>
    </div>
  );
};

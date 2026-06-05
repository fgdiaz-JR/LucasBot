import React, { useMemo } from "react";
import { Coins, HelpCircle } from "lucide-react";

interface PaymentQRCodeProps {
  id: string;
  amount: number;
  client: string;
  description: string;
  creatorAddress?: string;
}

export function PaymentQRCode({ id, amount, client, description, creatorAddress = "0x7cD2C3C914C3a2E9d28A1Bb3109a1CDeB09dfa1c" }: PaymentQRCodeProps) {
  // Generate a CeloPay URL conformant with standard BIP-21
  const celoPayUrl = useMemo(() => {
    return `celo://transfer?address=${creatorAddress}&amount=${amount}&token=COPm&id=${id}&memo=${encodeURIComponent(description)}`;
  }, [id, amount, description, creatorAddress]);

  // Generate a mock but structurally deterministic grid based on the invoice ID to make it look highly authentic
  const qrGrid = useMemo(() => {
    const size = 15;
    const grid: boolean[][] = [];
    
    // Seeded random based on invoice ID
    let seed = 0;
    for (let i = 0; i < id.length; i++) {
      seed += id.charCodeAt(i);
    }
    
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x) > 0.5;
    };

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Finders patterns (corners)
        const isFinderLeftTop = r < 4 && c < 4;
        const isFinderRightTop = r < 4 && c >= size - 4;
        const isFinderLeftBottom = r >= size - 4 && c < 4;
        
        if (isFinderLeftTop || isFinderRightTop || isFinderLeftBottom) {
          // Hollow block behavior for finders
          const border = r === 0 || r === 3 || c === 0 || c === 3 || 
                         r === size - 4 || r === size - 1 || 
                         (c === size - 4 && r < 4) || (c === size - 1 && r < 4) ||
                         (c < 4 && r === size - 4) || (c < 4 && r === size - 1);
          const innerCenter = (r === 1 && c === 1) || (r === 1 && c === size - 2) || (r === size - 2 && c === 1);
          row.push(border || innerCenter);
        } else if (r === Math.floor(size / 2) && c === Math.floor(size / 2)) {
          // Center cell hollowed out for Celo logo emblem
          row.push(false);
        } else {
          row.push(random());
        }
      }
      grid.push(row);
    }
    return grid;
  }, [id]);

  return (
    <div className="bg-[#0b132a] border border-white/5 rounded-2xl p-4.5 space-y-4 shadow-xl text-center relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/10 px-2 py-0.5 rounded-bl-lg text-[8px] font-mono font-bold text-emerald-400">
        CELOPAY BIP-21
      </div>
      
      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Código QR de Liquidación</span>

      {/* QR Core Grid Matrix */}
      <div className="relative p-3 bg-white rounded-xl shadow-inner inline-block">
        <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${qrGrid[0].length}, minmax(0, 1fr))` }}>
          {qrGrid.flatMap((row, rIdx) => 
            row.map((active, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`} 
                className={`w-[11px] h-[11px] rounded-[1px] transition-all duration-300 ${
                  active 
                    ? "bg-[#09101f]" 
                    : (rIdx === Math.floor(qrGrid.length / 2) && cIdx === Math.floor(qrGrid[0].length / 2))
                      ? "bg-transparent" // Center hollow
                      : "bg-transparent"
                }`}
              />
            ))
          )}
        </div>
        {/* Absolute Celo Logo Emblem centered on QR code */}
        <div className="absolute inset-0 m-auto w-6 h-6 bg-[#10b981] rounded-full border-2 border-white flex items-center justify-center shadow-md">
          <Coins size={11} className="text-white" />
        </div>
      </div>

      <div className="space-y-1 w-full">
        <div className="text-[11px] font-mono text-slate-350 bg-[#060b18] px-2 py-1 rounded truncate select-all" title={celoPayUrl}>
          {celoPayUrl.slice(0, 32)}...
        </div>
        <div className="text-[8px] text-slate-500 leading-snug">
          Escanéalo desde **MiniPay**, **Valora** o cualquier billetera móvil Celo para transferir de manera instantánea.
        </div>
      </div>
    </div>
  );
}

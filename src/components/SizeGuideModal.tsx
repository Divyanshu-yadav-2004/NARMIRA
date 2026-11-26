import React from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  open: boolean;
  onClose: () => void;
}

const SIZE_ROWS = [
  { size: 'XS', bust: '32"', waist: '26"', hip: '35"', shoulder: '13.5"' },
  { size: 'S', bust: '34"', waist: '28"', hip: '37"', shoulder: '14"' },
  { size: 'M', bust: '36"', waist: '30"', hip: '39"', shoulder: '14.5"' },
  { size: 'L', bust: '38"', waist: '32"', hip: '41"', shoulder: '15"' },
  { size: 'XL', bust: '40"', waist: '34"', hip: '43"', shoulder: '15.5"' },
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#302820]/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-[#F8F5EF] border border-[#D8C8B3] max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-[#D8C8B3]">
          <h3 className="font-serif text-2xl text-[#302820]">
            NARMIRA Size Guide
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="p-1 text-[#302820] hover:text-[#632D35]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#302820]/75 mt-4 leading-relaxed">
          Measurements below represent body measurements in inches. Our kurta
          sets are tailored with a comfortable 1.5–2 inch garment ease.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D8C8B3] text-[#632D35] uppercase tracking-[0.12em]">
                <th className="py-2.5 pr-4 font-medium">Size</th>
                <th className="py-2.5 pr-4 font-medium">Bust</th>
                <th className="py-2.5 pr-4 font-medium">Waist</th>
                <th className="py-2.5 pr-4 font-medium">Hip</th>
                <th className="py-2.5 font-medium">Shoulder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8C8B3]/50">
              {SIZE_ROWS.map((row) => (
                <tr key={row.size}>
                  <td className="py-2.5 pr-4 font-medium">{row.size}</td>
                  <td className="py-2.5 pr-4">{row.bust}</td>
                  <td className="py-2.5 pr-4">{row.waist}</td>
                  <td className="py-2.5 pr-4">{row.hip}</td>
                  <td className="py-2.5">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[#302820]/65 mt-5">
          Sarees measure 5.5 metres with a 0.9 metre unstitched blouse piece.
          Dupattas measure 2.5 metres.
        </p>
      </div>
    </div>
  );
};

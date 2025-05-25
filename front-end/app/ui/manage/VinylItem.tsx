import React, { useState } from 'react';
import { Vinyl } from '@/app/lib/definitions';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface VinylItemProps {
    vinyl: Vinyl;
    isSelected: boolean;
    onToggleSelect: () => void;
    onClickPlay: (e: React.MouseEvent) => void;
    selectionMode: boolean;
}

const VinylItem: React.FC<VinylItemProps> = ({
    vinyl,
    isSelected,
    onToggleSelect,
    selectionMode,
    onClickPlay,
}) => {
    const { t: c } = useTranslation('common');
    const { t: m } = useTranslation('manage');
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(true);
        onClickPlay(e);
        // Reset playing state after 5 seconds
        setTimeout(() => setIsPlaying(false), 5000);
    };

    return (
        <div
            onClick={selectionMode ? onToggleSelect : undefined}
            className={`relative w-72 h-[320px] rounded-xl bg-[#f8f6f1] shadow-xl border border-[#ccc] text-black overflow-hidden transition-transform hover:scale-[1.02] font-serif ${isSelected ? 'ring-2 ring-blue-400' : ''
                }`}
        >
            {/* Turntable Deck */}
            <div className="relative h-48 bg-gradient-to-b from-[#c49a6c] to-[#7b5e3b] flex items-center justify-center">
                {/* Vinyl Record */}
                <div className={`relative w-42 h-42 flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                    {/* SVG vinyl with grooves as background */}
                    <svg
                        width="168"
                        height="168"
                        viewBox="0 0 168 168"
                        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                        className="pointer-events-none select-none"
                    >
                        {/* Main vinyl base - pure black */}
                        <circle cx="84" cy="84" r="80" fill="#000" />
                        {/* Tighter etched grooves */}
                        {Array.from({ length: 22 }).map((_, i) => (
                            <circle
                                key={i}
                                cx="84"
                                cy="84"
                                r={48 + i * 1.6} // Start closer to label, expand in small steps
                                fill="none"
                                stroke="#aaa"
                                strokeOpacity={0.08 + 0.07 * Math.cos(i * 0.8)}
                                strokeWidth={i % 7 === 0 ? 0.95 : 0.5}
                            />
                        ))}
                        {/* Outer ring for sharp edge */}
                        <circle cx="84" cy="84" r="79" fill="none" stroke="#222" strokeWidth="2" strokeOpacity="0.22" />
                    </svg>
                    {/* Album art in center */}
                    <div className="absolute left-1/2 top-1/2 w-14 h-14 rounded-full overflow-hidden shadow-lg border-4 border-black z-10" style={{ transform: 'translate(-50%, -50%)' }}>
                        <img
                            src={vinyl.album_picture_url}
                            alt={vinyl.title}
                            className="w-full h-full object-cover rounded-full"
                            draggable={false}
                        />
                    </div>
                    {/* Spindle */}
                    <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full bg-[#c9b370] border border-[#8b7b35] z-20" style={{ transform: 'translate(-50%, -50%)' }} />
                </div>


                {/* SVG Tonearm - More Realistic */}
                <svg
                    className="absolute"
                    style={{
                        top: '18px',
                        right: '18px',
                        width: '130px', // canvas wider for counterweight
                        height: '40px',
                        pointerEvents: 'none',
                        zIndex: 10,
                        transform: isPlaying
                            ? 'rotate(-75deg)'
                            : 'rotate(-90deg)',
                        transformOrigin: '100px 20px', // still arm base
                        transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
                    }}
                >
                    <defs>
                        <radialGradient id="pivotGradient" cx="60%" cy="40%" r="90%">
                            <stop offset="0%" stopColor="#f0f0f0" />
                            <stop offset="100%" stopColor="#888" />
                        </radialGradient>
                        <linearGradient id="armGradient" x1="100" y1="20" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ececec" />
                            <stop offset="100%" stopColor="#b0b0b0" />
                        </linearGradient>
                        <filter id="armShadow" x="0" y="0" width="150%" height="150%">
                            <feDropShadow dx="0.5" dy="1.2" stdDeviation="1" floodColor="#000" floodOpacity="0.16" />
                        </filter>
                    </defs>
                    {/* --- Counterweight and gap --- */}
                    {/* Short shaft ("gap") between pivot and counterweight */}
                    <rect
                        x="100"
                        y="17.5"
                        width="12"
                        height="5"
                        rx="2.5"
                        fill="#bbb"
                        stroke="#888"
                        strokeWidth="0.6"
                    />
                    {/* Counterweight at end */}
                    <circle
                        cx="118"
                        cy="20"
                        r="8"
                        fill="url(#pivotGradient)"
                        stroke="#555"
                        strokeWidth="2"
                    />
                    {/* Pivot ring (bearing) */}
                    <circle
                        cx="100"
                        cy="20"
                        r="4"
                        fill="#bbb"
                        stroke="#444"
                        strokeWidth="1"
                    />
                    {/* --- Main arm --- */}
                    <rect
                        x="20"
                        y="17"
                        width="80"
                        height="6"
                        rx="3"
                        fill="url(#armGradient)"
                        stroke="#999"
                        strokeWidth="1"
                        filter="url(#armShadow)"
                    />
                    {/* --- Headshell/Cartridge --- */}
                    <rect
                        x="10"
                        y="13"
                        width="14"
                        height="14"
                        rx="2.5"
                        fill="#191919"
                        stroke="#333"
                        strokeWidth="1"
                    />
                    {/* Stylus tip */}
                    <circle
                        cx="10"
                        cy="20"
                        r="2"
                        fill="#e3e300"
                        stroke="#555"
                        strokeWidth="0.7"
                    />
                </svg>
            </div>

            {/* Info Section */}
            <div className="p-4 flex flex-row items-center justify-between h-[140px] text-[#2e2e2e]">
                <div className="flex-1">
                    <h2 className="text-lg font-bold tracking-wide">{vinyl.title}</h2>
                    <p className="text-sm italic text-gray-600">{vinyl.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {c('played')}: {vinyl.play_num} {c('times')}
                    </p>
                </div>
                <div className="ml-3">
                    <button
                        type="button"
                        onClick={handlePlayClick}
                        className="w-10 h-10 rounded-full bg-[#c9b370] text-black font-bold shadow hover:bg-[#b89f56] transition"
                        title={m('play')}
                        disabled={isPlaying}
                    >
                        {isPlaying ? '▶︎' : '▶'}
                    </button>
                </div>
            </div>

            {selectionMode && (
                <div className="absolute top-2 left-2">
                    {isSelected ? (
                        <CheckCircleIcon className="text-blue-500" />
                    ) : (
                        <RadioButtonUncheckedIcon className="text-gray-600" />
                    )}
                </div>
            )}
        </div>
    );
};

export default VinylItem;
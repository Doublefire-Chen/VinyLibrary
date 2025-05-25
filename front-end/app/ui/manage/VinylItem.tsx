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
            className={`relative w-full max-w-sm mx-auto aspect-[3/4] rounded-xl bg-[#f8f6f1] shadow-xl border border-[#ccc] text-black overflow-hidden transition-transform hover:scale-[1.02] font-serif ${isSelected ? 'ring-2 ring-blue-400' : ''
                }`}
            style={{ minWidth: '280px' }}
        >
            {/* Turntable Deck - takes up 60% of height */}
            <div className="relative h-[60%] bg-gradient-to-b from-[#c49a6c] to-[#7b5e3b] flex items-center justify-center">
                {/* Vinyl Record - responsive sizing */}
                <div className={`relative flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
                    style={{ width: 'min(200px, 85%)', height: 'min(200px, 85%)', aspectRatio: '1' }}>
                    {/* SVG vinyl with grooves as background */}
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 168 168"
                        style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                        className="pointer-events-none select-none"
                    >
                        {/* Main vinyl base - pure black */}
                        <circle cx="84" cy="84" r="80" fill="#000" />
                        {/* Tighter etched grooves */}
                        {Array.from({ length: 26 }).map((_, i) => (
                            <circle
                                key={i}
                                cx="84"
                                cy="84"
                                r={44 + i * 1.5} // Start closer to label, expand in small steps
                                fill="none"
                                stroke="#aaa"
                                strokeOpacity={0.08 + 0.07 * Math.cos(i * 0.8)}
                                strokeWidth={i % 7 === 0 ? 0.95 : 0.5}
                            />
                        ))}
                        {/* Outer ring for sharp edge */}
                        <circle cx="84" cy="84" r="79" fill="none" stroke="#222" strokeWidth="2" strokeOpacity="0.22" />
                    </svg>
                    {/* Album art in center - responsive sizing */}
                    <div className="absolute left-1/2 top-1/2 rounded-full overflow-hidden shadow-lg border-4 border-black z-10"
                        style={{
                            transform: 'translate(-50%, -50%)',
                            width: 'min(70px, 35%)',
                            height: 'min(70px, 35%)',
                            aspectRatio: '1'
                        }}>
                        <img
                            src={vinyl.album_picture_url}
                            alt={vinyl.title}
                            className="w-full h-full object-cover rounded-full"
                            draggable={false}
                        />
                    </div>
                    {/* Spindle - responsive sizing */}
                    <div className="absolute left-1/2 top-1/2 rounded-full bg-[#c9b370] border border-[#8b7b35] z-20"
                        style={{
                            transform: 'translate(-50%, -50%)',
                            width: 'min(12px, 6%)',
                            height: 'min(12px, 6%)',
                            aspectRatio: '1'
                        }} />
                </div>

                {/* SVG Tonearm - More Realistic and Responsive */}
                <svg
                    className="absolute"
                    style={{
                        top: '18%',
                        right: '4%',
                        width: 'min(180px, 60%)',
                        height: 'min(100px, 30%)',
                        pointerEvents: 'none',
                        zIndex: 10,
                        transform: isPlaying
                            ? 'rotate(-60deg)'
                            : 'rotate(-90deg)',
                        transformOrigin: '75% 50%',
                        transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)',
                    }}
                    viewBox="0 0 200 50"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <radialGradient id="pivotGradient" cx="60%" cy="40%" r="90%">
                            <stop offset="0%" stopColor="#f0f0f0" />
                            <stop offset="100%" stopColor="#888" />
                        </radialGradient>
                        <linearGradient id="armGradient" x1="120" y1="25" x2="-5" y2="25" gradientUnits="userSpaceOnUse">
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
                        x="160"
                        y="21.5"
                        width="16"
                        height="7"
                        rx="3.5"
                        fill="#bbb"
                        stroke="#888"
                        strokeWidth="0.8"
                    />
                    {/* Counterweight at end */}
                    <circle
                        cx="184"
                        cy="25"
                        r="10"
                        fill="url(#pivotGradient)"
                        stroke="#555"
                        strokeWidth="2"
                    />
                    {/* Pivot ring (bearing) */}
                    <circle
                        cx="160"
                        cy="25"
                        r="5"
                        fill="#bbb"
                        stroke="#444"
                        strokeWidth="1.5"
                    />
                    {/* --- Main arm --- */}
                    <rect
                        x="-5"
                        y="21.5"
                        width="165"
                        height="7"
                        rx="3.5"
                        fill="url(#armGradient)"
                        stroke="#999"
                        strokeWidth="1"
                        filter="url(#armShadow)"
                    />
                    {/* --- Headshell/Cartridge --- */}
                    <rect
                        x="-10"
                        y="17"
                        width="18"
                        height="16"
                        rx="3"
                        fill="#191919"
                        stroke="#333"
                        strokeWidth="1.2"
                    />
                    {/* Connection between arm and headshell */}
                    <rect
                        x="8"
                        y="20"
                        width="12"
                        height="10"
                        rx="2"
                        fill="#2a2a2a"
                        stroke="#444"
                        strokeWidth="0.8"
                    />

                    <rect
                        x="10"
                        y="22"
                        width="8"
                        height="6"
                        rx="1"
                        fill="#333"
                        stroke="#555"
                        strokeWidth="0.5"
                    />
                    {/* finger lift tab */}
                    <rect
                        x="16"
                        y="29.5"
                        width="4"
                        height="10"
                        rx="1.5"
                        fill="#333"
                        stroke="#666"
                        strokeWidth="0.5"
                    />
                    {/* Stylus tip */}
                    <circle
                        cx="2"
                        cy="25"
                        r="2.5"
                        fill="#ff0000"
                        stroke="#555"
                        strokeWidth="0.8"
                    />
                </svg>
            </div>

            {/* Info Section - takes up 40% of height */}
            <div className="h-[40%] p-4 flex flex-row items-center justify-between text-[#2e2e2e]">
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold tracking-wide truncate">{vinyl.title}</h2>
                    <p className="text-sm italic text-gray-600 truncate">{vinyl.artist}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {c('played')}: {vinyl.play_num} {c('times')}
                    </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={handlePlayClick}
                        className="w-10 h-10 rounded-full bg-[#c9b370] text-black font-bold shadow hover:bg-[#b89f56] transition flex items-center justify-center"
                        title={m('play')}
                        disabled={isPlaying}
                    >
                        {isPlaying ? '▶︎' : '▶'}
                    </button>
                </div>
            </div>

            {selectionMode && (
                <div className="absolute top-2 left-2 z-30">
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
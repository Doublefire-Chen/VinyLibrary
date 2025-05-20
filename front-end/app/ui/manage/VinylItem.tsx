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
            <div className="relative h-48 bg-gradient-to-b from-[#1a1a1a] to-[#2e2e2e] flex items-center justify-center">
                {/* Vinyl Record */}
                <div
                    className={`w-36 h-36 rounded-full bg-black border-[4px] border-gray-800 shadow-inner flex items-center justify-center relative ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                        }`}
                >
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                        <img
                            src={vinyl.album_picture_url}
                            alt={vinyl.title}
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <div className="absolute w-2.5 h-2.5 bg-[#c9b370] rounded-full z-10" />
                </div>

                {/* Tonearm with vertical (90 deg) initial position */}
                <div
                    className="absolute top-6 right-6 w-28 h-[2px] bg-gray-300 rounded-sm origin-top-right transition-transform duration-700"
                    style={{
                        transform: isPlaying ? 'rotate(-58deg)' : 'rotate(-90deg)',
                    }}
                >
                    {/* Add tonearm head */}
                    <div className="absolute right-0 -bottom-2 w-4 h-4 bg-gray-400 rounded-sm" />
                </div>
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
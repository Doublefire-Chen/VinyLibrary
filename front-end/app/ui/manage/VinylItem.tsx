// ui/manage/VinylItem.tsx
import React from 'react';
import { Vinyl } from '@/app/lib/definitions';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'react-i18next';

interface VinylItemProps {
    vinyl: Vinyl;
    isSelected: boolean;
    onToggleSelect: () => void;
    onClickPlay: (e: React.MouseEvent) => void;
    selectionMode: boolean; // Add selectionMode prop
}

const VinylItem: React.FC<VinylItemProps> = ({ vinyl, isSelected, onToggleSelect, selectionMode, onClickPlay }) => {
    const { t: c } = useTranslation('common');
    const { t: m } = useTranslation('manage');

    return (
        <div
            onClick={selectionMode ? onToggleSelect : undefined} // Allow select only in selection mode
            className={`border rounded overflow-hidden shadow-lg bg-white cursor-pointer transition hover:shadow-md relative w-64 ${isSelected ? 'border-blue-500 ring-2 ring-blue-400' : ''
                }`}
        >
            <img
                src={vinyl.album_picture_url}
                alt={vinyl.title}
                className="w-full h-40 object-cover"
            />
            <div className="p-4">
                <h2 className="text-xl font-semibold mb-1">{vinyl.title}</h2>
                <p className="text-sm text-gray-500">by {vinyl.artist}</p>
                <p className="text-sm mt-2">{c('played')}: {vinyl.play_num} {c('times')}</p>
                <div className="mt-3 flex justify-end">
                    <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1 cursor-pointer"
                        onClick={onClickPlay}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        {m('play')}
                    </button>
                </div>
            </div>
            {selectionMode && (
                <div
                    className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs bg-transparent"
                >
                    {isSelected ? <CheckCircleIcon className="text-white bg-blue-500 rounded-full" /> : <RadioButtonUncheckedIcon className="text-white" />}
                </div>
            )
            }
        </div >
    );
};

export default VinylItem;

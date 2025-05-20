import React from 'react';
import { Vinyl } from '@/app/lib/definitions';
import { useTranslation } from 'react-i18next';

const VinylCard: React.FC<{ vinyl: Vinyl }> = ({ vinyl }) => {
    // Format timestamp
    const formatTime = (time: string) => {
        const date = new Date(time);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZoneName: 'short',
        };
        return new Intl.DateTimeFormat('en-US', options)
            .format(date)
            .replace(/GMT/i, 'UTC');
    };
    const { t: c } = useTranslation('common');

    return (
        <div className="w-64 h-[520px] flex flex-col rounded-lg overflow-hidden shadow-lg bg-white border border-[#ddd] hover:shadow-xl transition-shadow duration-200">
            {/* Album Cover */}
            <div className="bg-white h-64 flex items-center justify-center px-2 py-2">
                <img
                    src={vinyl.album_picture_url}
                    alt={vinyl.title}
                    className="max-h-full max-w-full object-contain"
                />
            </div>

            {/* Info Section */}
            <div className="px-4 py-3 flex flex-col justify-between flex-1 font-serif text-[#2e2e2e]">
                <div>
                    <h2 className="font-bold text-lg tracking-wide mb-1">{vinyl.title}</h2>
                    <p className="text-sm text-gray-700 italic">{vinyl.artist}</p>
                    <p className="text-sm text-gray-500">{vinyl.year}</p>
                    <p className="text-sm mt-1 text-gray-800 line-clamp-3">{vinyl.description}</p>
                    <p className="text-sm text-gray-500 mt-2">{c('played')}: {vinyl.play_num} {c('times')}</p>
                </div>
                <div className="mt-2 pt-2 border-t text-sm">
                    <p className="text-gray-700">{formatTime(vinyl.timebought)}</p>
                    <p className="font-bold text-black mt-1">{vinyl.price} {vinyl.currency}</p>
                </div>
            </div>
        </div>
    );
};

export default VinylCard;

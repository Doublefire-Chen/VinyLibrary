import React from 'react';
import { Vinyl } from '@/app/lib/definitions';

const VinylCard: React.FC<{ vinyl: Vinyl }> = ({ vinyl }) => {
    // 格式化时间
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
        const formattedTime = new Intl.DateTimeFormat('en-US', options).format(date);
        return formattedTime.replace(/GMT/i, 'UTC');
    };
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
            <img className="w-full" src={vinyl.album_picture_url} alt={vinyl.title} />
            <div className="px-6 py-4">
                <h2 className="font-bold text-xl mb-2">{vinyl.title}</h2>
                <p className="text-gray-700 text-base">{vinyl.artist}</p>
                <p className="text-gray-600 text-sm">{vinyl.year}</p>
                <p className="text-gray-800 text-md mt-2">{vinyl.description}</p>
                <p className="text-gray-800 text-md mt-2">{formatTime(vinyl.timebought)}</p>
                <p className="text-gray-900 font-semibold mt-2">{vinyl.price} {vinyl.currency}</p>
            </div>
        </div>
    );
};

export default VinylCard;
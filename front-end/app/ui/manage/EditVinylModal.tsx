import { Vinyl } from '@/app/lib/definitions';
import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import MacOSTrafficLights from '@/app/ui/MacOSTrafficLights';
import { Track } from '@/app/lib/definitions';
import { useTranslation } from 'react-i18next';

interface EditVinylModalProps {
    vinyl: Vinyl;
    onClose: () => void;
    onSave: (updatedVinyl: Vinyl) => void;
}

export default function EditVinylModal({ vinyl, onClose, onSave }: EditVinylModalProps) {
    const [editedVinyl, setEditedVinyl] = useState<Vinyl>({ ...vinyl });
    const [isHovered, setIsHovered] = useState(false); // Shared hover state
    const { t: c } = useTranslation('common');
    const { t: m } = useTranslation('manage');

    const handleChange = (field: keyof Vinyl, value: string | number) => {
        setEditedVinyl((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const formData = new FormData();

            // Use the correct field name that matches the backend expectation
            formData.append('album_picture', e.target.files[0]);

            // Add the required fields from the current edited vinyl data
            formData.append('title', editedVinyl.title);
            formData.append('artist', editedVinyl.artist);
            formData.append('vinyl_type', editedVinyl.vinyl_type);
            formData.append('vinyl_number', editedVinyl.vinyl_number.toString());

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                const data = await res.json();
                console.log(data); // For debugging

                if (data.url) {
                    setEditedVinyl((prev) => ({ ...prev, album_picture_url: data.url }));
                } else {
                    alert(`Upload failed: ${data.error || 'No URL returned'}`);
                }
            } catch (err) {
                console.error(err);
                alert('Upload failed');
            }
        }
    };

    const handleTrackChange = (index: number, field: keyof Track, value: string | number) => {
        const updatedTracklist = [...editedVinyl.tracklist];
        updatedTracklist[index] = {
            ...updatedTracklist[index],
            [field]: value
        };
        setEditedVinyl((prev) => ({ ...prev, tracklist: updatedTracklist }));
    };

    const addTrack = () => {
        setEditedVinyl((prev) => ({
            ...prev,
            tracklist: [...prev.tracklist, { side: '', order: prev.tracklist.length + 1, title: '', length: '' }]
        }));
    };

    const removeTrack = (index: number) => {
        const updatedTracklist = editedVinyl.tracklist.filter((_, i) => i !== index);
        setEditedVinyl((prev) => ({ ...prev, tracklist: updatedTracklist }));
    };


    const formatOriginalTime = (time: string) => {
        // If the time is already in the desired format, return as is
        if (time.includes('UTC') || time.match(/\d{4}-\d{2}-\d{2},\s\d{2}:\d{2}:\d{2}\sUTC[+-]\d/)) {
            return time;
        }

        // If it's an ISO string, convert to the original format
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // Get timezone offset
        const offset = date.getTimezoneOffset();
        const offsetHours = Math.abs(Math.floor(offset / 60));
        const offsetMinutes = Math.abs(offset % 60);
        const offsetSign = offset <= 0 ? '+' : '-';
        const timezoneString = `UTC${offsetSign}${offsetHours}`;

        return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${timezoneString}`;
    };

    return (
        <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-xl shadow-xl w-[600px] max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tab bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-blue-100 rounded-t-xl flex items-center px-24">
                    <div className="text-gray-700 font-medium truncate">{m('edit_vinyl')}: {editedVinyl.title}</div>
                </div>

                {/* macOS 红绿灯 */}
                <div className="flex space-x-2 absolute top-4 left-4"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <MacOSTrafficLights type="close" isHovered={isHovered} onClick={onClose} />
                    <MacOSTrafficLights type="minimize" isHovered={isHovered} />
                    <MacOSTrafficLights type="maximize" isHovered={isHovered} />
                </div>

                <h2 className="text-xl font-bold mb-4 mt-4 text-center">{m('edit_vinyl_info')}</h2>
                <div className="flex justify-center items-center mb-4 gap-4">
                    <Image
                        src={editedVinyl.album_picture_url}
                        alt="Album Cover"
                        width={160}
                        height={160}
                        className="w-40 h-40 object-cover rounded-xl shadow"
                    />
                    <div className="flex items-end h-40">
                        <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                            {m('choose_file')}
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>

                {/* 这里是限制滚动区域的容器 */}
                <div className="max-h-[50vh] overflow-auto mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="mb-1 text-gray-500">{c('title')}</p>
                            <input type="text" value={editedVinyl.title} onChange={(e) => handleChange('title', e.target.value)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('artist')}</p>
                            <input type="text" value={editedVinyl.artist} onChange={(e) => handleChange('artist', e.target.value)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('year')}</p>
                            <input type="number" value={editedVinyl.year} onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('vinyl_type')}</p>
                            <input type="text" value={editedVinyl.vinyl_type} onChange={(e) => handleChange('vinyl_type', e.target.value)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('vinyl_number')}</p>
                            <input type="number" value={editedVinyl.vinyl_number} onChange={(e) => handleChange('vinyl_number', parseInt(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('play_count')}</p>
                            <input type="number" value={editedVinyl.play_num} onChange={(e) => handleChange('play_num', parseInt(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('time_bought')}</p>
                            <input
                                type="text"
                                value={formatOriginalTime(editedVinyl.timebought)}
                                onChange={(e) => handleChange('timebought', e.target.value)}
                                className="border p-2 rounded-lg w-full"
                                placeholder="YYYY-MM-DD, HH:MM:SS UTC+X"
                            />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('price')}</p>
                            <input type="number" value={editedVinyl.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div>
                            <p className="mb-1 text-gray-500">{c('currency')}</p>
                            <input type="text" value={editedVinyl.currency} onChange={(e) => handleChange('currency', e.target.value)} className="border p-2 rounded-lg w-full" />
                        </div>
                        <div className="col-span-2">
                            <p className="mb-1 text-gray-500">{c('description')}</p>
                            <textarea value={editedVinyl.description} onChange={(e) => handleChange('description', e.target.value)} className="border p-2 rounded-lg w-full" rows={3} />
                        </div>
                        {/* Tracklist Section */}
                        <div className="col-span-2 mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-medium text-gray-700">{c('track_list')}</p>
                                <button
                                    onClick={addTrack}
                                    className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700"
                                >
                                    {m('add_track')}
                                </button>
                            </div>

                            {/* Column Headers */}
                            <div className="flex gap-2 mb-1 items-center text-sm text-gray-600 font-medium">
                                <div className="w-1/6 px-2">{c('side')}</div>
                                <div className="w-1/6 px-2">{c('order')}</div>
                                <div className="w-1/2 px-2">{c('title')}</div>
                                <div className="w-1/6 px-2">{c('length')}</div>
                                <div className="w-[28px]"></div>
                            </div>

                            {editedVinyl.tracklist
                                .sort((a, b) => {
                                    // First sort by side
                                    if (a.side < b.side) return -1;
                                    if (a.side > b.side) return 1;
                                    // If sides are the same, sort by order
                                    return a.order - b.order;
                                })
                                .map((track, index) => (
                                    <div key={index} className="flex gap-2 mb-2 items-center">
                                        <div className="w-1/6">
                                            <input
                                                type="text"
                                                placeholder={c('side')}
                                                value={track.side}
                                                onChange={(e) => handleTrackChange(index, 'side', e.target.value)}
                                                className="border p-2 rounded-lg w-full text-sm"
                                            />
                                        </div>
                                        <div className="w-1/6">
                                            <input
                                                type="number"
                                                placeholder={c('order')}
                                                value={track.order}
                                                onChange={(e) => handleTrackChange(index, 'order', parseInt(e.target.value) || 0)}
                                                className="border p-2 rounded-lg w-full text-sm"
                                            />
                                        </div>
                                        <div className="w-1/2">
                                            <input
                                                type="text"
                                                placeholder={c('title')}
                                                value={track.title}
                                                onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                                                className="border p-2 rounded-lg w-full text-sm"
                                            />
                                        </div>
                                        <div className="w-[20%]">
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="999"
                                                    placeholder="Min"
                                                    value={track.length.split(':')[0] || '0'}
                                                    onChange={(e) => {
                                                        const min = e.target.value || '0';
                                                        const sec = track.length.split(':')[1] || '00';
                                                        handleTrackChange(index, 'length', `${min}:${sec}`);
                                                    }}
                                                    onBlur={(e) => {
                                                        if (e.target.value === '') {
                                                            const sec = track.length.split(':')[1] || '00';
                                                            handleTrackChange(index, 'length', `0:${sec}`);
                                                        }
                                                    }}
                                                    className="w-[45%] p-2 border rounded-lg text-sm text-center"
                                                />
                                                <span className="mx-1.5 text-gray-500">:</span>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    placeholder="Sec"
                                                    value={(track.length.split(':')[1] || '00').padStart(2, '0')}
                                                    onChange={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, ''); // remove non-digit
                                                        let num = parseInt(raw);
                                                        if (isNaN(num)) num = 0;
                                                        if (num > 59) num = 59;
                                                        const formattedSec = num.toString().padStart(2, '0');
                                                        const min = track.length.split(':')[0] || '0';
                                                        handleTrackChange(index, 'length', `${min}:${formattedSec}`);
                                                    }}
                                                    onBlur={(e) => {
                                                        const raw = e.target.value.replace(/\D/g, '');
                                                        let num = parseInt(raw);
                                                        if (isNaN(num)) num = 0;
                                                        const formattedSec = num.toString().padStart(2, '0');
                                                        const min = track.length.split(':')[0] || '0';
                                                        handleTrackChange(index, 'length', `${min}:${formattedSec}`);
                                                    }}
                                                    className="w-[45%] p-2 border rounded-lg text-sm text-center"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeTrack(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-auto justify-end">
                    <button onClick={() => onSave(editedVinyl)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save</button>
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                </div>
            </div>
        </div>
    );
}
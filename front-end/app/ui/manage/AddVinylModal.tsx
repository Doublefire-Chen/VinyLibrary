import { Vinyl, Track } from '@/app/lib/definitions';
import { useState, ChangeEvent, useRef, useCallback } from 'react';
import Image from 'next/image';
import MacOSTrafficLights from '@/app/ui/MacOSTrafficLights';
import { timezones } from '@/app/lib/definitions';
import { useTranslation } from 'react-i18next';

interface AddVinylModalProps {
    onClose: () => void;
    onSave: (newVinyl: Vinyl) => void;
}

interface TimeParts {
    date: string;
    time: string;
    timezone: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AddVinylModal({ onClose, onSave }: AddVinylModalProps) {
    const { t: m } = useTranslation('manage');
    const { t: c } = useTranslation('common');

    const [newVinyl, setNewVinyl] = useState<Vinyl>({
        id: 0, // This will likely be set by the backend
        title: '',
        artist: '',
        year: new Date().getFullYear(),
        vinyl_type: '',
        vinyl_number: 0,
        play_num: 0,
        timebought: '', // example: 2024-09-20T10:30:00+02:00
        price: 0,
        currency: '',
        description: '',
        album_picture_url: '/12-serato-performance-series-black-1-xl.webp', // Add a default placeholder image
        tracklist: [],
    });
    const [isHovered, setIsHovered] = useState(false);

    const monthInputRef = useRef<HTMLInputElement>(null);
    const dayInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);
    const timeZoneInputRef = useRef<HTMLSelectElement>(null);

    const parseTimebought = useCallback((timebought: string): TimeParts => {
        const [date = '', timeWithTz = ''] = timebought.split('T');
        const time = timeWithTz.substring(0, 8) || '';
        const timezone = timeWithTz.substring(8) || '';
        return { date, time, timezone };
    }, []);

    const buildTimebought = useCallback((date: string, time: string, timezone: string): string => {
        return `${date}T${time}${timezone}`.trim();
    }, []);

    const showAlert = useCallback((message: string) => {
        window.alert(message);
    }, []);

    const handleChange = useCallback((field: keyof Vinyl, value: string | number | Track[]) => {
        setNewVinyl((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const formData = new FormData();
        formData.append('album_picture', e.target.files[0]);

        // Add the required form fields
        formData.append('title', newVinyl.title);
        formData.append('artist', newVinyl.artist);
        formData.append('vinyl_type', newVinyl.vinyl_type);
        formData.append('vinyl_number', newVinyl.vinyl_number.toString());

        try {
            const res = await fetch(`${BACKEND_URL}/api/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await res.json();
            console.log(data);

            if (data.url) {
                setNewVinyl((prev) => ({ ...prev, album_picture_url: data.url }));
            } else {
                showAlert(`Upload failed: ${data.error || 'No URL returned'}`);
            }
        } catch (error) {
            console.error(error);
            showAlert('Upload failed');
        }
    }, [newVinyl.title, newVinyl.artist, newVinyl.vinyl_type, newVinyl.vinyl_number, showAlert]);

    const handleTrackChange = useCallback((index: number, field: keyof Track, value: string | number) => {
        const updatedTracklist = [...newVinyl.tracklist];
        updatedTracklist[index] = {
            ...updatedTracklist[index],
            [field]: value,
        };
        setNewVinyl((prev) => ({ ...prev, tracklist: updatedTracklist }));
    }, [newVinyl.tracklist]);

    const addTrack = useCallback(() => {
        setNewVinyl((prev) => ({
            ...prev,
            tracklist: [...prev.tracklist, {
                side: '',
                order: prev.tracklist.length + 1,
                title: '',
                length: '',
            }],
        }));

        // Allow time for the state to update and the new track to render
        setTimeout(() => {
            // Scroll to the bottom of the tracklist container
            const container = document.getElementById('tracklist-container');
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }, 50);
    }, []);

    const removeTrack = useCallback((index: number) => {
        const updatedTracklist = newVinyl.tracklist.filter((_, i) => i !== index);
        setNewVinyl((prev) => ({ ...prev, tracklist: updatedTracklist }));
    }, [newVinyl.tracklist]);

    const handleYearChange = useCallback((yearValue: string) => {
        const { time, timezone } = parseTimebought(newVinyl.timebought);
        const [, monthPart = '', dayPart = ''] = newVinyl.timebought.split('T')[0]?.split('-') || [];

        const constrainedYear = Math.max(0, Math.min(9999, parseInt(yearValue) || 0)).toString();
        const newDate = yearValue ? `${constrainedYear}-${monthPart}-${dayPart}` : '';

        handleChange('timebought', buildTimebought(newDate, time, timezone));

        // Auto-focus to month when year has 4 digits
        if (yearValue.length === 4 && monthInputRef.current) {
            monthInputRef.current.focus();
        }
    }, [newVinyl.timebought, parseTimebought, buildTimebought, handleChange]);

    const handleMonthChange = useCallback((monthValue: string) => {
        const { time, timezone } = parseTimebought(newVinyl.timebought);
        const dateParts = newVinyl.timebought.split('T')[0]?.split('-') || [];
        const year = dateParts[0] || new Date().getFullYear().toString();
        const day = dateParts[2] || '';

        const constrainedMonth = Math.max(1, Math.min(12, parseInt(monthValue) || 1)).toString();
        const newDate = year ? `${year}-${constrainedMonth}-${day}` : '';

        handleChange('timebought', buildTimebought(newDate, time, timezone));

        if (monthValue.length === 2 && dayInputRef.current) {
            dayInputRef.current.focus();
        }
    }, [newVinyl.timebought, parseTimebought, buildTimebought, handleChange]);

    const handleDayChange = useCallback((dayValue: string) => {
        const { time, timezone } = parseTimebought(newVinyl.timebought);
        const dateParts = newVinyl.timebought.split('T')[0]?.split('-') || [];
        const year = dateParts[0] || new Date().getFullYear().toString();
        const month = dateParts[1] || (new Date().getMonth() + 1).toString();

        const constrainedDay = Math.max(1, Math.min(31, parseInt(dayValue) || 1)).toString();
        const newDate = year && month ? `${year}-${month}-${constrainedDay}` : '';

        handleChange('timebought', buildTimebought(newDate, time, timezone));

        // Auto-focus to time when day has 2 digits
        if (dayValue.length === 2 && timeInputRef.current) {
            setTimeout(() => {
                timeInputRef.current?.focus();
            }, 50);
        }
    }, [newVinyl.timebought, parseTimebought, buildTimebought, handleChange]);

    const handleTimeChange = useCallback((timeValue: string) => {
        const { timezone } = parseTimebought(newVinyl.timebought);
        const dateParts = newVinyl.timebought.split('T')[0]?.split('-') || [];
        const year = dateParts[0]?.padStart(4, '0') || new Date().getFullYear().toString().padStart(4, '0');
        const month = dateParts[1]?.padStart(2, '0') || (new Date().getMonth() + 1).toString().padStart(2, '0');
        const day = dateParts[2]?.padStart(2, '0') || new Date().getDate().toString().padStart(2, '0');

        const datePart = year && month && day ? `${year}-${month}-${day}` : '';
        handleChange('timebought', buildTimebought(datePart, timeValue, timezone));
    }, [newVinyl.timebought, parseTimebought, buildTimebought, handleChange]);

    const handleTimezoneChange = useCallback((timezoneValue: string) => {
        const { time } = parseTimebought(newVinyl.timebought);
        const datePart = newVinyl.timebought.split('T')[0] || '1900-01-01';

        handleChange('timebought', buildTimebought(datePart, time, timezoneValue));
        console.log(buildTimebought(datePart, time, timezoneValue));
    }, [newVinyl.timebought, parseTimebought, buildTimebought, handleChange]);

    const handleTimeKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // Only track number keys (0-9)
        if (/^\d$/.test(e.key)) {
            const input = e.currentTarget.value;
            // Track keystrokes with a data attribute
            const currentCount = Number(e.currentTarget.dataset.keyCount || '0');
            const newCount = currentCount + 1;
            e.currentTarget.dataset.keyCount = newCount.toString();

            // Focus to timezone either when the time is fully entered (8 chars)
            // or when user has typed several characters (indicating manual entry)
            if ((input.length === 8 && newCount >= 6) && timeZoneInputRef.current) {
                timeZoneInputRef.current.focus();
                // Reset the counter after focusing
                e.currentTarget.dataset.keyCount = '0';
            }
        }
    }, []);

    const handleTrackMinuteChange = useCallback((index: number, minutes: string) => {
        const track = newVinyl.tracklist[index];
        const seconds = track?.length.split(':')[1] || '00';
        handleTrackChange(index, 'length', `${minutes}:${seconds}`);
    }, [newVinyl.tracklist, handleTrackChange]);

    const handleTrackSecondChange = useCallback((index: number, rawSeconds: string) => {
        const track = newVinyl.tracklist[index];
        const minutes = track?.length.split(':')[0] || '0';

        let seconds = parseInt(rawSeconds) || 0;
        seconds = Math.max(0, Math.min(59, seconds));
        const formattedSeconds = seconds.toString().padStart(2, '0');

        handleTrackChange(index, 'length', `${minutes}:${formattedSeconds}`);
    }, [newVinyl.tracklist, handleTrackChange]);

    const isUploadDisabled = !newVinyl.title || !newVinyl.artist || !newVinyl.vinyl_type || !newVinyl.vinyl_number;
    const isSaveDisabled = !newVinyl.title || !newVinyl.artist;

    const currencyOptions = [
        { value: 'USD', label: `🇺🇸 $ (${m('currency.USD')})` },
        { value: 'EUR', label: `🇪🇺 € (${m('currency.EUR')})` },
        { value: 'SEK', label: `🇸🇪 kr (${m('currency.SEK')})` },
        { value: 'GBP', label: `🇬🇧 £ (${m('currency.GBP')})` },
        { value: 'JPY', label: `🇯🇵 ¥ (${m('currency.JPY')})` },
        { value: 'CNY', label: `🇨🇳 ¥ (${m('currency.CNY')})` },
        { value: 'CHF', label: `🇨🇭 Fr (${m('currency.CHF')})` },
        { value: 'CAD', label: `🇨🇦 $ (${m('currency.CAD')})` },
        { value: 'AUD', label: `🇦🇺 $ (${m('currency.AUD')})` },
    ];

    const sortedTracklist = [...newVinyl.tracklist].sort((a, b) => {
        // First sort by side
        if (a.side < b.side) return -1;
        if (a.side > b.side) return 1;
        // If sides are the same, sort by order
        return a.order - b.order;
    });

    const { date, time, timezone } = parseTimebought(newVinyl.timebought);
    const [year = '', month = '', day = ''] = date.split('-');

    return (
        <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-[1100]"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-xl shadow-xl w-[600px] max-h-[90vh] relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tab bar */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-blue-100 rounded-t-xl flex items-center px-24">
                    <div className="text-gray-700 font-medium truncate">{m('add_new_vinyl')}</div>
                </div>

                {/* macOS Traffic Lights */}
                <div
                    className="flex space-x-2 absolute top-4 left-4"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <MacOSTrafficLights type="close" isHovered={isHovered} onClick={onClose} />
                    <MacOSTrafficLights type="minimize" isHovered={isHovered} />
                    <MacOSTrafficLights type="maximize" isHovered={isHovered} />
                </div>

                <h2 className="text-xl font-bold mb-4 mt-4 text-center">{m('add_new_vinyl')}</h2>
                <div className="flex justify-center items-center mb-4 gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-lg border border-gray-200">
                        <Image
                            src={newVinyl.album_picture_url}
                            alt="Album Cover"
                            width={144}
                            height={144}
                            className="w-36 h-36 object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col items-start gap-2 mt-auto">
                        <label
                            className={`${isUploadDisabled
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } text-white px-4 py-2 rounded-lg`}
                        >
                            {m('choose_file')}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploadDisabled}
                            />
                        </label>
                        {isUploadDisabled && (
                            <p className="text-xs text-red-500 max-w-[200px]">
                                {m('cover_upload_warning')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="max-h-[50vh] overflow-auto mb-4 grid grid-cols-2 gap-4 auto-rows-min" id="tracklist-container">
                    <div>
                        <p className="mb-1 text-gray-500">{c('title')}</p>
                        <input
                            type="text"
                            value={newVinyl.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="border p-2 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('artist')}</p>
                        <input
                            type="text"
                            value={newVinyl.artist}
                            onChange={(e) => handleChange('artist', e.target.value)}
                            className="border p-2 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('year')}</p>
                        <input
                            type="number"
                            value={newVinyl.year}
                            onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)}
                            className="border p-2 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('vinyl_type')}</p>
                        <div className="relative">
                            <input
                                type="text"
                                value={newVinyl.vinyl_type}
                                onChange={(e) => handleChange('vinyl_type', e.target.value)}
                                className="border p-2 rounded-lg w-full"
                                placeholder={m('select_or_type')}
                                list="vinyl-types"
                            />
                            <datalist id="vinyl-types">
                                <option value="LP" />
                                <option value="EP" />
                                <option value="SP" />
                            </datalist>
                        </div>
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('vinyl_number')}</p>
                        <input
                            type="number"
                            value={newVinyl.vinyl_number}
                            onChange={(e) => handleChange('vinyl_number', parseInt(e.target.value) || 0)}
                            className="border p-2 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('play_count')}</p>
                        <input
                            type="number"
                            value={newVinyl.play_num}
                            onChange={(e) => handleChange('play_num', parseInt(e.target.value) || 0)}
                            className="border p-2 rounded-lg w-full"
                        />
                    </div>
                    <div className="col-span-2 grid grid-cols-[2fr_1fr] auto-rows-min">
                        <p className="mb-1 text-gray-500 col-span-2">{c('time_bought')}</p>
                        <div className="flex gap-1 items-center mr-2">
                            <input
                                type="number"
                                placeholder="YYYY"
                                min="0"
                                max="9999"
                                value={year}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="border p-2 rounded-lg flex-1"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                ref={monthInputRef}
                                placeholder="MM"
                                min="1"
                                max="12"
                                value={month}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                className="border p-2 rounded-lg flex-1"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                ref={dayInputRef}
                                placeholder="DD"
                                min="1"
                                max="31"
                                value={day}
                                onChange={(e) => handleDayChange(e.target.value)}
                                className="border p-2 rounded-lg flex-1"
                            />
                            <input
                                type="time"
                                ref={timeInputRef}
                                step="1"
                                value={time}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                onKeyUp={handleTimeKeyUp}
                                className="border p-2 rounded-lg flex-1"
                            />
                        </div>
                        <div className="flex-1">
                            <select
                                value={timezone}
                                ref={timeZoneInputRef}
                                onChange={(e) => handleTimezoneChange(e.target.value)}
                                className="max-w-full border p-2 rounded-lg w-full h-[42px]"
                            >
                                <option value="">{m('select_timezone')}</option>
                                <option value="+02:00">CET summer (UTC+02:00)</option>
                                <option value="+01:00">CET (UTC+01:00)</option>
                                {timezones.map((tz) => (
                                    <option key={tz.tzCode} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('price')}</p>
                        <input
                            type="number"
                            value={newVinyl.price}
                            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                            className="border p-2 rounded-lg w-full"
                        />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">{c('currency')}</p>
                        <div className="relative">
                            <input
                                type="text"
                                value={newVinyl.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="border p-2 rounded-lg w-full"
                                placeholder={m('select_or_type')}
                                list="currencies"
                            />
                            <datalist id="currencies">
                                {currencyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <p className="mb-1 text-gray-500">{c('description')}</p>
                        <textarea
                            value={newVinyl.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="border p-2 rounded-lg w-full"
                            rows={3}
                        />
                    </div>

                    {/* Tracklist Section */}
                    <div className="col-span-2 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-gray-700">{c('track_list')}</p>
                            <button
                                onClick={addTrack}
                                className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700"
                                type="button"
                            >
                                {m('add_track')}
                            </button>
                        </div>

                        {/* Column Headers */}
                        <div className="flex gap-2 mb-1 items-center text-sm text-gray-600 font-medium w-full">
                            <div className="w-[12%] px-2">{c('side')}</div>
                            <div className="w-[12%] px-2">{c('order')}</div>
                            <div className="w-[43%] px-2">{c('title')}</div>
                            <div className="w-[25%] px-2">{c('length')}</div>
                        </div>

                        {sortedTracklist.map((track, index) => (
                            <div key={index} className="flex gap-2 mb-2 items-center w-full">
                                <div className="w-[12%]">
                                    <input
                                        type="text"
                                        placeholder="Side"
                                        value={track.side}
                                        onChange={(e) => handleTrackChange(index, 'side', e.target.value)}
                                        className="border p-2 rounded-lg w-full text-sm"
                                    />
                                </div>
                                <div className="w-[12%]">
                                    <input
                                        type="number"
                                        placeholder="Order"
                                        value={track.order}
                                        onChange={(e) => handleTrackChange(index, 'order', parseInt(e.target.value) || 0)}
                                        className="border p-2 rounded-lg w-full text-sm"
                                    />
                                </div>
                                <div className="w-[43%]">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={track.title}
                                        onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                                        className="border p-2 rounded-lg w-full text-sm"
                                    />
                                </div>
                                <div className="w-[25%]">
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="999"
                                            placeholder="Min"
                                            value={track.length.split(':')[0] || ''}
                                            onChange={(e) => handleTrackMinuteChange(index, e.target.value)}
                                            onBlur={(e) => {
                                                if (e.target.value === '') {
                                                    handleTrackMinuteChange(index, '0');
                                                }
                                            }}
                                            className="w-[45%] p-2 border rounded-lg text-sm text-center"
                                        />
                                        <span className="mx-1.5 text-gray-500">:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            placeholder="Sec"
                                            value={track.length.split(':')[1] || ''}
                                            onChange={(e) => handleTrackSecondChange(index, e.target.value)}
                                            onBlur={(e) => {
                                                if (e.target.value === '') {
                                                    handleTrackSecondChange(index, '0');
                                                } else {
                                                    // Ensure proper formatting on blur
                                                    const secValue = e.target.value;
                                                    // Only pad with zeros if it's a single digit
                                                    const formattedSec = secValue.length === 1 ? secValue.padStart(2, '0') : secValue;
                                                    const minutes = track.length.split(':')[0] || '0';
                                                    handleTrackChange(index, 'length', `${minutes}:${formattedSec}`);
                                                }
                                            }}
                                            className="w-[45%] p-2 border rounded-lg text-sm text-center"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeTrack(index)}
                                    className="text-red-600 hover:text-red-800"
                                    type="button"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 mt-auto justify-end">
                    <button
                        onClick={() => onSave(newVinyl)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        disabled={isSaveDisabled}
                        type="button"
                    >
                        {m('add_new_vinyl')}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        type="button"
                    >
                        {m('cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
}
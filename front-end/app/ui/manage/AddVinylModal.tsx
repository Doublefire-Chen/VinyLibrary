import { Vinyl, Track } from '@/app/lib/definitions';
import { useState, ChangeEvent, useRef } from 'react';
import MacOSTrafficLights from '@/app/ui/MacOSTrafficLights';
import { timezones } from '@/app/lib/definitions'
import { time } from 'console';

interface AddVinylModalProps {
    onClose: () => void;
    onSave: (newVinyl: Vinyl) => void;
}

export default function AddVinylModal({ onClose, onSave }: AddVinylModalProps) {
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
        tracklist: []
    });
    const [isHovered, setIsHovered] = useState(false);

    const handleChange = (field: keyof Vinyl, value: any) => {
        setNewVinyl((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('album_picture', e.target.files[0]);

            // Add the required form fields
            formData.append('title', newVinyl.title);
            formData.append('artist', newVinyl.artist);
            formData.append('vinyl_type', newVinyl.vinyl_type);
            formData.append('vinyl_number', newVinyl.vinyl_number.toString());

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                const data = await res.json();
                console.log(data);

                if (data.url) {
                    setNewVinyl((prev) => ({ ...prev, album_picture_url: data.url }));
                } else {
                    alert('Upload failed: ' + (data.error || 'No URL returned'));
                }
            } catch (err) {
                console.error(err);
                alert('Upload failed');
            }
        }
    };

    const handleTrackChange = (index: number, field: keyof Track, value: string | number) => {
        const updatedTracklist = [...newVinyl.tracklist];
        updatedTracklist[index] = {
            ...updatedTracklist[index],
            [field]: value
        };
        setNewVinyl((prev) => ({ ...prev, tracklist: updatedTracklist }));
    };

    const addTrack = () => {
        setNewVinyl((prev) => ({
            ...prev,
            tracklist: [...prev.tracklist, { side: '', order: prev.tracklist.length + 1, title: '', length: '' }]
        }));
    };

    const removeTrack = (index: number) => {
        const updatedTracklist = newVinyl.tracklist.filter((_, i) => i !== index);
        setNewVinyl((prev) => ({ ...prev, tracklist: updatedTracklist }));
    };

    const monthInputRef = useRef<HTMLInputElement>(null);
    const dayInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);
    const timeZoneInputRef = useRef<HTMLSelectElement>(null);

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
                    <div className="text-gray-700 font-medium truncate">Add New Vinyl</div>
                </div>

                {/* macOS Traffic Lights */}
                <div className="flex space-x-2 absolute top-4 left-4"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <MacOSTrafficLights type="close" isHovered={isHovered} onClick={onClose} />
                    <MacOSTrafficLights type="minimize" isHovered={isHovered} />
                    <MacOSTrafficLights type="maximize" isHovered={isHovered} />
                </div>

                <h2 className="text-xl font-bold mb-4 mt-4 text-center">Add New Vinyl</h2>
                <div className="flex justify-center items-center mb-4 gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-lg border border-gray-200">
                        <img
                            src={newVinyl.album_picture_url}
                            alt="Album Cover"
                            className="w-40 h-40 object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex flex-col items-start gap-2 mt-auto">
                        <label
                            className={`${newVinyl.title && newVinyl.artist && newVinyl.vinyl_type && newVinyl.vinyl_number
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-gray-400 cursor-not-allowed"
                                } text-white px-4 py-2 rounded-lg`}
                        >
                            Choose File
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={!newVinyl.title || !newVinyl.artist || !newVinyl.vinyl_type || !newVinyl.vinyl_number}
                            />
                        </label>
                        {(!newVinyl.title || !newVinyl.artist || !newVinyl.vinyl_type || !newVinyl.vinyl_number) && (
                            <p className="text-xs text-red-500 max-w-[200px]">
                                Please fill in title, artist, vinyl type and vinyl number before uploading
                            </p>
                        )}
                    </div>
                </div>

                <div className="max-h-[50vh] overflow-auto mb-4 grid grid-cols-2 gap-4 auto-rows-min" id="tracklist-container">
                    <div>
                        <p className="mb-1 text-gray-500">Title</p>
                        <input type="text" value={newVinyl.title} onChange={(e) => handleChange('title', e.target.value)} className="border p-2 rounded-lg w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Artist</p>
                        <input type="text" value={newVinyl.artist} onChange={(e) => handleChange('artist', e.target.value)} className="border p-2 rounded-lg w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Year</p>
                        <input type="number" value={newVinyl.year} onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Vinyl Type</p>
                        <div className="relative">
                            <input
                                type="text"
                                value={newVinyl.vinyl_type}
                                onChange={(e) => handleChange('vinyl_type', e.target.value)}
                                className="border p-2 rounded-lg w-full"
                                placeholder="Select or type custom"
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
                        <p className="mb-1 text-gray-500">Vinyl Number</p>
                        <input type="number" value={newVinyl.vinyl_number} onChange={(e) => handleChange('vinyl_number', parseInt(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Play Count</p>
                        <input type="number" value={newVinyl.play_num} onChange={(e) => handleChange('play_num', parseInt(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                    </div>
                    <div className="col-span-2 grid grid-cols-[2fr_1fr] auto-rows-min">
                        <p className="mb-1 text-gray-500 col-span-2">Time Bought</p>
                        <div className="flex gap-1 items-center mr-2">
                            <input
                                type="number"
                                placeholder="YYYY"
                                min="0"
                                max="9999"
                                value={newVinyl.timebought.split('T')[0].split('-')[0] || ''}
                                onChange={(e) => {
                                    const yearValue = e.target.value;
                                    const [prevDate] = newVinyl.timebought.split('T');
                                    const parts = prevDate ? prevDate.split('-') : ['', '', ''];
                                    const month = parts[1] || '';
                                    const day = parts[2] || '';

                                    // Extract time and timezone from the existing value
                                    const timePart = newVinyl.timebought.split('T')[1] || '';
                                    const timeValue = timePart ? timePart.substring(0, 8) : ''; // Extract HH:MM:SS
                                    const timezone = timePart ? timePart.substring(8) : ''; // Extract timezone offset

                                    // Combine all parts into a new timebought string
                                    const newDate = yearValue ? `${yearValue}-${month}-${day}` : '';
                                    handleChange('timebought', `${newDate}T${timeValue}${timezone}`.trim());

                                    // make sure the year is between 0 and 9999
                                    const validYearValue = parseInt(yearValue);
                                    const constrainedYear = validYearValue < 0 ? '0' :
                                        validYearValue > 9999 ? '9999' :
                                            yearValue;

                                    if (constrainedYear !== yearValue) {
                                        e.target.value = constrainedYear;
                                        const [prevDate] = newVinyl.timebought.split('T');
                                        const parts = prevDate ? prevDate.split('-') : ['', '', ''];
                                        const month = parts[1] || '';
                                        const day = parts[2] || '';
                                        const timePart = newVinyl.timebought.split('T')[1] || '';
                                        const timeValue = timePart ? timePart.substring(0, 8) : '';
                                        const timezone = timePart ? timePart.substring(8) : '';
                                        const newDate = constrainedYear ? `${constrainedYear}-${month}-${day}` : '';
                                        handleChange('timebought', `${newDate}T${timeValue}${timezone}`.trim());
                                    }

                                    // Auto-focus to month when year has 4 digits
                                    if (yearValue.length === 4 && monthInputRef.current) {
                                        monthInputRef.current.focus();
                                    }
                                }}
                                className="border p-2 rounded-lg flex-1"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                ref={monthInputRef}
                                placeholder="MM"
                                min="1"
                                max="12"
                                value={newVinyl.timebought.split('T')[0].split('-')[1] || ''}
                                onChange={(e) => {
                                    const monthValue = e.target.value;
                                    const dateParts = newVinyl.timebought.split('T')[0].split('-');
                                    const year = dateParts[0] || new Date().getFullYear().toString();
                                    const day = dateParts[2] || '';

                                    // Extract time and timezone
                                    const timePart = newVinyl.timebought.split('T')[1] || '';
                                    const timeValue = timePart ? timePart.substring(0, 8) : '';
                                    const timezone = timePart ? timePart.substring(8) : '';

                                    const newDate = year ? `${year}-${monthValue}-${day}` : '';
                                    handleChange('timebought', `${newDate}T${timeValue}${timezone}`.trim());

                                    // make sure the month is between 1 and 12
                                    const validMonthValue = parseInt(monthValue);
                                    const constrainedMonth = validMonthValue < 1 ? '1' :
                                        validMonthValue > 12 ? '12' :
                                            monthValue;
                                    if (constrainedMonth !== monthValue) {
                                        e.target.value = constrainedMonth;
                                        const dateParts = newVinyl.timebought.split('T')[0].split('-');
                                        const year = dateParts[0] || new Date().getFullYear().toString();
                                        const day = dateParts[2] || '';
                                        const timePart = newVinyl.timebought.split('T')[1] || '';
                                        const timeValue = timePart ? timePart.substring(0, 8) : '';
                                        const timezone = timePart ? timePart.substring(8) : '';
                                        const newDate = year ? `${year}-${constrainedMonth}-${day}` : '';
                                        handleChange('timebought', `${newDate}T${timeValue}${timezone}`.trim());
                                    }

                                    if ((monthValue.length === 2) && dayInputRef.current) {
                                        dayInputRef.current.focus();
                                    }
                                }}
                                className="border p-2 rounded-lg flex-1"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                ref={dayInputRef}
                                placeholder="DD"
                                min="1"
                                max="31"
                                value={newVinyl.timebought.split('T')[0].split('-')[2] || ''}
                                onChange={(e) => {
                                    const dayValue = e.target.value;
                                    const dateParts = newVinyl.timebought.split('T')[0].split('-');
                                    const year = dateParts[0] || new Date().getFullYear().toString();
                                    const month = dateParts[1] || (new Date().getMonth() + 1).toString();

                                    // Extract time and timezone, example format: 2024-09-20T10:30:00+02:00
                                    const timePart = newVinyl.timebought.split('T')[1] || '';
                                    const timeValue = timePart ? timePart.substring(0, 8) : '';
                                    const timezone = timePart ? timePart.substring(8) : '';

                                    const newDate = year && month ? `${year}-${month}-${dayValue}` : '';
                                    handleChange('timebought', `${newDate}T${timeValue}${timezone}`.trim());

                                    // make sure the day is between 1 and 31
                                    const validDayValue = parseInt(dayValue);
                                    const constrainedDay = validDayValue < 1 ? '1' :
                                        validDayValue > 31 ? '31' :
                                            dayValue;
                                    if (constrainedDay !== dayValue) {
                                        e.target.value = constrainedDay;
                                        const dateParts = newVinyl.timebought.split('T')[0].split('-');
                                        const year = dateParts[0] || new Date().getFullYear().toString();
                                        const month = dateParts[1] || (new Date().getMonth() + 1).toString();
                                        const timePart = newVinyl.timebought.split('T')[1] || '';
                                        const timeValue = timePart ? timePart.substring(0, 8) : '';
                                        const timezone = timePart ? timePart.substring(8) : '';
                                        const newDate = year && month ? `${year}-${month}-${constrainedDay}` : '';
                                        handleChange('timebought', `${newDate}T${timeValue}${timezone}`.trim());
                                    }
                                    // Auto-focus to time when day has 2 digits
                                    if ((dayValue.length === 2) && timeInputRef.current) {
                                        setTimeout(() => {
                                            timeInputRef.current?.focus();
                                        }, 50); // Small delay prevents unintended key press
                                    }
                                }}
                                className="border p-2 rounded-lg flex-1"
                            />
                            <input
                                type="time"
                                ref={timeInputRef}
                                step="1"
                                value={newVinyl.timebought.split('T')[1]?.substring(0, 8) || ''}
                                onChange={(e) => {
                                    const dateParts = (newVinyl.timebought.split('T')[0] || '').split('-');
                                    const year = dateParts[0]?.padStart(4, '0') || new Date().getFullYear().toString().padStart(4, '0');
                                    const month = dateParts[1]?.padStart(2, '0') || (new Date().getMonth() + 1).toString().padStart(2, '0');
                                    const day = dateParts[2]?.padStart(2, '0') || new Date().getDate().toString().padStart(2, '0');
                                    const datePart = year && month && day ? `${year}-${month}-${day}` : '';
                                    // Extract timezone
                                    const timePart = newVinyl.timebought.split('T')[1] || '';
                                    const timezone = timePart ? timePart.substring(8) : '';
                                    const timeValue = e.target.value;

                                    handleChange('timebought', `${datePart}T${timeValue}${timezone}`.trim());
                                }}
                                onKeyUp={(e) => {
                                    // Only track number keys (0-9)
                                    if (/^\d$/.test(e.key)) {
                                        const input = e.currentTarget.value;
                                        // Track keystrokes with a data attribute
                                        const currentCount = Number(e.currentTarget.dataset.keyCount || '0');
                                        const newCount = currentCount + 1;
                                        e.currentTarget.dataset.keyCount = newCount.toString();
                                        console.log('Key count:', newCount);
                                        // Focus to timezone either when the time is fully entered (8 chars)
                                        // or when user has typed several characters (indicating manual entry)
                                        if ((input.length === 8 && newCount >= 6) && timeZoneInputRef.current) {
                                            timeZoneInputRef.current.focus();
                                            // Reset the counter after focusing
                                            e.currentTarget.dataset.keyCount = '0';
                                        }
                                    }
                                }}
                                className="border p-2 rounded-lg flex-1"
                            />
                        </div>
                        <div className="flex-1">
                            <select
                                value={newVinyl.timebought.split('T')[1]?.substring(8) || ''}
                                ref={timeZoneInputRef}
                                onChange={(e) => {
                                    const datePart = newVinyl.timebought.split('T')[0] || '1900-01-01';
                                    const timePart = newVinyl.timebought.split('T')[1] || '00:00:00+00:00';
                                    const timeValue = timePart ? timePart.substring(0, 8) : '';

                                    handleChange('timebought', `${datePart}T${timeValue}${e.target.value}`.trim());
                                    //debug
                                    console.log(`${datePart}T${timeValue}${e.target.value}`);
                                }}
                                className="max-w-full border p-2 rounded-lg w-full h-[42px]"
                            >
                                <option value="">Select timezone</option>
                                <option value="+02:00">CET summer (UTC+02:00)</option>
                                <option value="+01:00">CET (UTC+01:00)</option>
                                {timezones.map((tz) => (
                                    <option key={tz.tzCode} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Price</p>
                        <input type="number" value={newVinyl.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} className="border p-2 rounded-lg w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Currency</p>
                        <div className="relative">
                            <input
                                type="text"
                                value={newVinyl.currency}
                                onChange={(e) => handleChange('currency', e.target.value)}
                                className="border p-2 rounded-lg w-full"
                                placeholder="Select or type custom"
                                list="currencies"
                            />
                            <datalist id="currencies">
                                <option value="USD">🇺🇸 $ (US Dollar)</option>
                                <option value="EUR">🇪🇺 € (Euro)</option>
                                <option value="SEK">🇸🇪 kr (Swedish Krona)</option>
                                <option value="GBP">🇬🇧 £ (British Pound)</option>
                                <option value="JPY">🇯🇵 ¥ (Japanese Yen)</option>
                                <option value="CNY">🇨🇳 ¥ (Chinese Yuan)</option>
                                <option value="CHF">🇨🇭 Fr (Swiss Franc)</option>
                                <option value="CAD">🇨🇦 $ (Canadian Dollar)</option>
                                <option value="AUD">🇦🇺 $ (Australian Dollar)</option>
                            </datalist>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <p className="mb-1 text-gray-500">Description</p>
                        <textarea value={newVinyl.description} onChange={(e) => handleChange('description', e.target.value)} className="border p-2 rounded-lg w-full" rows={3} />
                    </div>
                    {/* Tracklist Section */}
                    <div className="col-span-2 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-gray-700">Tracklist</p>
                            <button
                                onClick={() => {
                                    addTrack();
                                    // Allow time for the state to update and the new track to render
                                    setTimeout(() => {
                                        // Scroll to the bottom of the tracklist container
                                        const container = document.getElementById('tracklist-container');
                                        if (container) {
                                            container.scrollTo({
                                                top: container.scrollHeight,
                                                behavior: 'smooth'
                                            });
                                        }
                                    }, 50);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 text-sm rounded-lg hover:bg-blue-700"
                            >
                                Add Track
                            </button>
                        </div>

                        {/* Column Headers */}
                        <div className="flex gap-2 mb-1 items-center text-sm text-gray-600 font-medium">
                            <div className="w-1/6 px-2">Side</div>
                            <div className="w-1/6 px-2">Order</div>
                            <div className="w-1/2 px-2">Title</div>
                            <div className="w-1/6 px-2">Length</div>
                            <div className="w-[28px]"></div>
                        </div>

                        {newVinyl.tracklist
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
                                            placeholder="Side"
                                            value={track.side}
                                            onChange={(e) => handleTrackChange(index, 'side', e.target.value)}
                                            className="border p-2 rounded-lg w-full text-sm"
                                        />
                                    </div>
                                    <div className="w-1/6">
                                        <input
                                            type="number"
                                            placeholder="Order"
                                            value={track.order}
                                            onChange={(e) => handleTrackChange(index, 'order', parseInt(e.target.value) || 0)}
                                            className="border p-2 rounded-lg w-full text-sm"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={track.title}
                                            onChange={(e) => handleTrackChange(index, 'title', e.target.value)}
                                            className="border p-2 rounded-lg w-full text-sm"
                                        />
                                    </div>
                                    <div className="w-1/6">
                                        <input
                                            type="text"
                                            placeholder="Length"
                                            value={track.length}
                                            onChange={(e) => handleTrackChange(index, 'length', e.target.value)}
                                            className="border p-2 rounded-lg w-full text-sm"
                                        />
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

                <div className="flex gap-4 mt-auto justify-end">
                    <button
                        onClick={() => onSave(newVinyl)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        disabled={!newVinyl.title || !newVinyl.artist}
                    >
                        Add Vinyl
                    </button>
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                </div>
            </div>
        </div >
    );
}
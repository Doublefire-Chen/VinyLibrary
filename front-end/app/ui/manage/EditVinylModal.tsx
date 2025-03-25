import { Vinyl } from '@/app/lib/definitions';
import { useState, ChangeEvent } from 'react';

interface EditVinylModalProps {
    vinyl: Vinyl;
    onClose: () => void;
    onSave: (updatedVinyl: Vinyl) => void;
}

export default function EditVinylModal({ vinyl, onClose, onSave }: EditVinylModalProps) {
    const [editedVinyl, setEditedVinyl] = useState<Vinyl>({ ...vinyl });

    const handleChange = (field: keyof Vinyl, value: any) => {
        setEditedVinyl((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const formData = new FormData();
            formData.append('file', e.target.files[0]);

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                const data = await res.json();
                if (data.url) {
                    setEditedVinyl((prev) => ({ ...prev, album_picture_url: data.url }));
                    alert('图片上传成功！');
                } else {
                    alert('图片上传失败');
                }
            } catch (err) {
                console.error(err);
                alert('上传出错');
            }
        }
    };

    return (
        <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded shadow-xl w-[600px] max-h-[90vh] overflow-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* macOS 红绿灯 */}
                <div className="flex space-x-2 absolute top-4 left-4">
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full shadow-inner"></div>
                    <div className="w-3.5 h-3.5 bg-yellow-400 rounded-full shadow-inner"></div>
                    <div className="w-3.5 h-3.5 bg-green-500 rounded-full shadow-inner"></div>
                </div>

                <h2 className="text-xl font-bold mb-4 mt-4 text-center">Edit Vinyl Info</h2>
                <div className="flex justify-center mb-4">
                    <img src={editedVinyl.album_picture_url} alt="Album Cover" className="w-40 h-40 object-cover rounded shadow" />
                </div>
                <div className="flex justify-center mb-4">
                    <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
                        Choose File
                        <input type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="mb-1 text-gray-500">Title</p>
                        <input type="text" value={editedVinyl.title} onChange={(e) => handleChange('title', e.target.value)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Artist</p>
                        <input type="text" value={editedVinyl.artist} onChange={(e) => handleChange('artist', e.target.value)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Year</p>
                        <input type="number" value={editedVinyl.year} onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Vinyl Type</p>
                        <input type="text" value={editedVinyl.vinyl_type} onChange={(e) => handleChange('vinyl_type', e.target.value)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Vinyl Number</p>
                        <input type="number" value={editedVinyl.vinyl_number} onChange={(e) => handleChange('vinyl_number', parseInt(e.target.value) || 0)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Play Count</p>
                        <input type="number" value={editedVinyl.play_num} onChange={(e) => handleChange('play_num', parseInt(e.target.value) || 0)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Time Bought</p>
                        <input type="text" value={editedVinyl.timebought} onChange={(e) => handleChange('timebought', e.target.value)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Price</p>
                        <input type="number" value={editedVinyl.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} className="border p-2 rounded w-full" />
                    </div>
                    <div>
                        <p className="mb-1 text-gray-500">Currency</p>
                        <input type="text" value={editedVinyl.currency} onChange={(e) => handleChange('currency', e.target.value)} className="border p-2 rounded w-full" />
                    </div>
                    <div className="col-span-2">
                        <p className="mb-1 text-gray-500">Description</p>
                        <textarea value={editedVinyl.description} onChange={(e) => handleChange('description', e.target.value)} className="border p-2 rounded w-full" rows={3} />
                    </div>
                </div>
                <div className="flex gap-4 mt-6 justify-end">
                    <button onClick={() => onSave(editedVinyl)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                </div>
            </div>
        </div>
    );
}

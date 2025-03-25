import { Vinyl } from '@/app/lib/definitions';
import { useState } from 'react';

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

    return (
        <div
            className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-50"
            onClick={onClose}   // 点击空白处关闭
        >
            <div
                className="bg-white p-6 rounded shadow-xl w-[600px] max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()} // 阻止点击内容区域冒泡
            >
                <h2 className="text-xl font-bold mb-4">Edit Vinyl Info</h2>
                <div className="grid grid-cols-2 gap-4">
                    <p className="col-span-2 text-sm text-gray-500">ID: {editedVinyl.id}</p>
                    <input type="text" value={editedVinyl.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Title" className="border p-2 rounded" />
                    <input type="text" value={editedVinyl.artist} onChange={(e) => handleChange('artist', e.target.value)} placeholder="Artist" className="border p-2 rounded" />
                    <input type="number" value={editedVinyl.year} onChange={(e) => handleChange('year', parseInt(e.target.value) || 0)} placeholder="Year" className="border p-2 rounded" />
                    <input type="text" value={editedVinyl.vinyl_type} onChange={(e) => handleChange('vinyl_type', e.target.value)} placeholder="Vinyl Type" className="border p-2 rounded" />
                    <input type="number" value={editedVinyl.vinyl_number} onChange={(e) => handleChange('vinyl_number', parseInt(e.target.value) || 0)} placeholder="Vinyl Number" className="border p-2 rounded" />
                    <input type="text" value={editedVinyl.album_picture_url} onChange={(e) => handleChange('album_picture_url', e.target.value)} placeholder="Album Picture URL" className="border p-2 rounded" />
                    <input type="number" value={editedVinyl.play_num} onChange={(e) => handleChange('play_num', parseInt(e.target.value) || 0)} placeholder="Play Count" className="border p-2 rounded" />
                    <input type="text" value={editedVinyl.timebought} onChange={(e) => handleChange('timebought', e.target.value)} placeholder="Time Bought" className="border p-2 rounded" />
                    <input type="number" value={editedVinyl.price} onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)} placeholder="Price" className="border p-2 rounded" />
                    <input type="text" value={editedVinyl.currency} onChange={(e) => handleChange('currency', e.target.value)} placeholder="Currency" className="border p-2 rounded" />
                    <textarea value={editedVinyl.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description" className="border p-2 rounded col-span-2" rows={3} />
                </div>
                <div className="flex gap-4 mt-4 justify-end">
                    <button onClick={() => onSave(editedVinyl)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                </div>
            </div>
        </div>
    );
}

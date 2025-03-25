'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vinyl } from '@/app/lib/definitions';
import VinylItem from '@/app/ui/manage/VinylItem';
import Link from 'next/link';

export default function ManagePage() {
    const [vinyls, setVinyls] = useState<Vinyl[]>([]);
    const [selectedVinyls, setSelectedVinyls] = useState<number[]>([]);
    const [selectedVinylForEdit, setSelectedVinylForEdit] = useState<Vinyl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectionMode, setSelectionMode] = useState(false);
    const router = useRouter();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    useEffect(() => {
        const fetchVinyls = async () => {
            try {
                const res = await fetch(`${backendUrl}/api/vinyls`, { credentials: 'include' });

                if (res.status === 401) {
                    router.push('/login');
                    return;
                }

                const data = await res.json();
                setVinyls(data);
            } catch (error) {
                console.error('Error fetching vinyls:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVinyls();
    }, [backendUrl, router]);

    const handleDeleteSelected = async () => {
        if (!confirm('Are you sure you want to delete the selected vinyls?')) return;

        for (const id of selectedVinyls) {
            await fetch(`${backendUrl}/api/vinyls/${id}`, { method: 'DELETE', credentials: 'include' });
        }
        setVinyls(vinyls.filter((v) => !selectedVinyls.includes(v.id)));
        setSelectedVinyls([]);
        setSelectionMode(false);
    };

    const toggleSelectVinyl = (id: number) => {
        setSelectedVinyls((prev) =>
            prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]
        );
    };

    const handleVinylClick = (vinyl: Vinyl) => {
        if (!selectionMode) {
            setSelectedVinylForEdit(vinyl);
        }
    };

    const handleVinylUpdate = async () => {
        if (selectedVinylForEdit) {
            await fetch(`${backendUrl}/api/vinyls/${selectedVinylForEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(selectedVinylForEdit),
            });

            setVinyls(vinyls.map((v) => (v.id === selectedVinylForEdit.id ? selectedVinylForEdit : v)));
            setSelectedVinylForEdit(null);
            alert('Vinyl updated successfully.');
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manage Vinyls</h1>
                <div className="space-x-2">
                    {!selectionMode && (
                        <>
                            <button onClick={() => setSelectionMode(true)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Select Vinyls</button>
                            <Link href="/manage/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add New Vinyl</Link>
                            <Link href="/profile" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Profile</Link>
                            <Link href="/" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">Go to Home</Link>
                        </>
                    )}
                    {selectionMode && (
                        <>
                            {selectedVinyls.length > 0 && (
                                <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete Selected</button>
                            )}
                            <button onClick={() => { setSelectionMode(false); setSelectedVinyls([]); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
                {vinyls.map((vinyl) => (
                    <div key={vinyl.id} onClick={() => handleVinylClick(vinyl)}>
                        <VinylItem vinyl={vinyl} isSelected={selectedVinyls.includes(vinyl.id)} onToggleSelect={() => toggleSelectVinyl(vinyl.id)} selectionMode={selectionMode} />
                    </div>
                ))}
            </div>

            {selectedVinylForEdit && (
                <div className="mt-8 p-4 border rounded bg-gray-100">
                    <h2 className="text-xl font-bold mb-4">Edit Vinyl Info</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={selectedVinylForEdit.title} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, title: e.target.value })} placeholder="Title" className="border p-2 rounded" />
                        <input type="text" value={selectedVinylForEdit.artist} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, artist: e.target.value })} placeholder="Artist" className="border p-2 rounded" />
                        <input type="number" value={selectedVinylForEdit.year} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, year: parseInt(e.target.value) || 0 })} placeholder="Year" className="border p-2 rounded" />
                        <input type="text" value={selectedVinylForEdit.vinyl_type} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, vinyl_type: e.target.value })} placeholder="Vinyl Type" className="border p-2 rounded" />
                        <input type="number" value={selectedVinylForEdit.vinyl_number} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, vinyl_number: parseInt(e.target.value) || 0 })} placeholder="Vinyl Number" className="border p-2 rounded" />
                        <input type="text" value={selectedVinylForEdit.album_picture_url} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, album_picture_url: e.target.value })} placeholder="Album Picture URL" className="border p-2 rounded" />
                        <input type="number" value={selectedVinylForEdit.play_num} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, play_num: parseInt(e.target.value) || 0 })} placeholder="Play Count" className="border p-2 rounded" />
                        <input type="text" value={selectedVinylForEdit.timebought} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, timebought: e.target.value })} placeholder="Time Bought" className="border p-2 rounded" />
                        <input type="number" value={selectedVinylForEdit.price} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, price: parseFloat(e.target.value) || 0 })} placeholder="Price" className="border p-2 rounded" />
                        <input type="text" value={selectedVinylForEdit.currency} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, currency: e.target.value })} placeholder="Currency" className="border p-2 rounded" />
                        <textarea value={selectedVinylForEdit.description} onChange={(e) => setSelectedVinylForEdit({ ...selectedVinylForEdit, description: e.target.value })} placeholder="Description" className="border p-2 rounded col-span-2" rows={3} />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <button onClick={handleVinylUpdate} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save Changes</button>
                        <button onClick={() => setSelectedVinylForEdit(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

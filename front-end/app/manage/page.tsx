'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vinyl } from '@/app/lib/definitions';
import VinylItem from '@/app/ui/manage/VinylItem';
import EditVinylModal from '@/app/ui/manage/EditVinylModal';
import Link from 'next/link';
import AddVinylModal from '@/app/ui/manage/AddVinylModal';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export default function ManagePage() {
    const [vinyls, setVinyls] = useState<Vinyl[]>([]);
    const [selectedVinyls, setSelectedVinyls] = useState<number[]>([]);
    const [selectedVinylForEdit, setSelectedVinylForEdit] = useState<Vinyl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectionMode, setSelectionMode] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const [addNewVinyl, setAddNewVinyl] = useState(false);
    const { t: m } = useTranslation('manage');
    const { t: c } = useTranslation('common');

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
                setError('Failed to load vinyls. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVinyls();
    }, [backendUrl, router]);

    const handleDeleteSelected = async () => {
        if (!confirm('Are you sure you want to delete the selected vinyls?')) return;

        try {
            for (const id of selectedVinyls) {
                await fetch(`${backendUrl}/api/vinyls/${id}`, { method: 'DELETE', credentials: 'include' });
            }
            setVinyls(vinyls.filter((v) => !selectedVinyls.includes(v.id)));
            setSelectedVinyls([]);
            setSelectionMode(false);
        } catch (err) {
            console.error('Error deleting vinyls:', err);
            setError('Failed to delete selected vinyls.');
        }
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

    const handleVinylUpdate = (updatedVinyl: Vinyl) => {
        setVinyls(vinyls.map((v) => (v.id === updatedVinyl.id ? updatedVinyl : v)));
        setSelectedVinylForEdit(null);
    };

    const handlePlay = async (user_id: number, vinyl_id: number) => {
        const now = new Date();
        const now_date = format(now, "yyyy-MM-dd'T'HH:mm:ssxxx");
        console.log(now_date); // Will output like: 2024-09-20T10:30:00+02:00

        try {
            await fetch(`${backendUrl}/api/vinyls/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    user_id,
                    vinyl_id,
                    play_time: now_date
                }),
            });

            // Refresh vinyl data after play
            const res = await fetch(`${backendUrl}/api/vinyls`, { credentials: 'include' });
            if (res.ok) {
                const updatedVinyls = await res.json();
                setVinyls(updatedVinyls);
            }
        } catch (err) {
            console.error('Error recording play:', err);
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">{m("loading")}</div>;
    }

    return (
        <div className="p-4 space-y-4">
            {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{m("manage")}</h1>
                <div className="space-x-2">
                    {!selectionMode && (
                        <>
                            <button onClick={() => setSelectionMode(true)} className="inline-block box-border border border-transparent bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-medium leading-none focus:outline-none focus:ring-2">{m("select")}</button>
                            <button onClick={() => setAddNewVinyl(true)} className="inline-block box-border border border-transparent bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 font-medium leading-none focus:outline-none focus:ring-2">{m("add_new_vinyl")}</button>
                            <Link href="/profile" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium leading-none">{c("profile")}</Link>
                            <Link href="/" className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 font-medium leading-none">{c("homepage")}</Link>
                        </>
                    )}
                    {selectionMode && (
                        <>
                            {selectedVinyls.length > 0 && (
                                <button onClick={handleDeleteSelected} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">{c("delete_selected")}</button>
                            )}
                            <button onClick={() => { setSelectionMode(false); setSelectedVinyls([]); }} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">{m("cancel")}</button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
                {vinyls.map((vinyl) => (
                    <div key={vinyl.id} onClick={() => !selectionMode && handleVinylClick(vinyl)}>
                        <VinylItem
                            vinyl={vinyl}
                            isSelected={selectedVinyls.includes(vinyl.id)}
                            onToggleSelect={() => toggleSelectVinyl(vinyl.id)}
                            selectionMode={selectionMode}
                            onClickPlay={(e) => {
                                e.stopPropagation();
                                handlePlay(parseInt(localStorage.getItem('user_id') || '0'), vinyl.id);
                            }}
                        />
                    </div>
                ))}
            </div>

            {selectedVinylForEdit && (
                <EditVinylModal
                    vinyl={selectedVinylForEdit}
                    onClose={() => setSelectedVinylForEdit(null)}
                    onSave={async (updatedVinyl) => {
                        try {
                            await fetch(`${backendUrl}/api/vinyls/${updatedVinyl.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(updatedVinyl),
                            });
                            setVinyls(vinyls.map((v) => (v.id === updatedVinyl.id ? updatedVinyl : v)));
                            setSelectedVinylForEdit(null);
                            alert('Vinyl updated successfully.');
                        } catch (err) {
                            console.error('Error updating vinyl:', err);
                            alert('Failed to update vinyl.');
                        }
                    }}
                />
            )}

            {addNewVinyl && (
                <AddVinylModal
                    onClose={() => setAddNewVinyl(false)}
                    onSave={async (newVinyl) => {
                        try {
                            const res = await fetch(`${backendUrl}/api/vinyls`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify(newVinyl),
                            });
                            const data = await res.json();
                            setVinyls([...vinyls, data]);
                            setAddNewVinyl(false);
                            alert('Vinyl added successfully.');
                        } catch (err) {
                            console.error('Error adding vinyl:', err);
                            alert('Failed to add vinyl.');
                        }
                    }
                    }
                />
            )}
        </div>
    );
}

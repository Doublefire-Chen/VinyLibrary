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
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';

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

    const handleBackup = async () => {
        try {
            const res = await fetch(`${backendUrl}/api/backup`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!res.ok) {
                alert('Backup failed');
                return;
            }

            const blob = await res.blob();
            let filename = "backup.zip";
            const disposition = res.headers.get('Content-Disposition');
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    filename = match[1];
                }
            }
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Backup failed');
        }
    };

    const handleRestore = async () => {
        // Create file input dynamically
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.zip';

        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('backup', file);

            try {
                const res = await fetch(`${backendUrl}/api/restore`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });
                if (res.ok) {
                    alert('Restore successful!');
                    // Refresh the page automatically
                    window.location.reload();
                } else {
                    const data = await res.json();
                    alert('Restore failed: ' + (data?.error || 'Unknown error'));
                }
            } catch (err) {
                alert('Restore failed.');
            }
        };

        input.click();
    };

    if (isLoading) {
        return <div className="text-center py-8">{m("loading")}</div>;
    }

    return (
        <div className="min-h-screen bg-[#f8f6f1] p-6 font-serif text-[#2e2e2e]">
            {error && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded border border-red-300">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#c9b370]">
                <h1 className="text-3xl font-bold tracking-wide uppercase">{m('manage')}</h1>
                <div className="flex flex-wrap gap-3">
                    {!selectionMode ? (
                        <>
                            <button
                                onClick={() => setSelectionMode(true)}
                                className="bg-[#c9b370] text-black px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#b89f56] transition-all outline-none focus:ring-2 focus:ring-[#c9b370] focus:ring-offset-2 vinyl-glossy"
                            >
                                {m('select')}
                            </button>
                            <button
                                onClick={() => setAddNewVinyl(true)}
                                className="bg-[#c9b370] text-black px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#b89f56] transition-all outline-none focus:ring-2 focus:ring-[#c9b370] focus:ring-offset-2 vinyl-glossy"
                            >
                                {m('add_new_vinyl')}
                            </button>
                            <Link
                                href="/profile"
                                className="bg-[#445a7c] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#394e6b] transition-all outline-none focus:ring-2 focus:ring-[#445a7c] focus:ring-offset-2"
                            >
                                {c('profile')}
                            </Link>
                            <Link
                                href="/"
                                className="bg-[#445a7c] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#394e6b] transition-all outline-none focus:ring-2 focus:ring-[#445a7c] focus:ring-offset-2"
                            >
                                {c('homepage')}
                            </Link>
                            <button
                                onClick={handleBackup}
                                className="bg-[#445a7c] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#394e6b] transition-all outline-none focus:ring-2 focus:ring-[#445a7c] focus:ring-offset-2"
                            >
                                {m('backup')}
                            </button>
                            <button
                                onClick={handleRestore}
                                className="bg-[#aa4a44] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#993d38] transition-all outline-none focus:ring-2 focus:ring-[#aa4a44] focus:ring-offset-2"
                            >
                                {m('restore')}
                            </button>
                            <LanguageSwitcher />
                        </>
                    ) : (
                        <>
                            {selectedVinyls.length > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    className="bg-[#aa4a44] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#993d38] transition-all outline-none focus:ring-2 focus:ring-[#aa4a44] focus:ring-offset-2"
                                >
                                    {m('delete_selected')}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setSelectionMode(false);
                                    setSelectedVinyls([]);
                                }}
                                className="bg-[#888] text-white px-4 py-1.5 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#777] transition-all outline-none focus:ring-2 focus:ring-[#888] focus:ring-offset-2"
                            >
                                {m('cancel')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
                {vinyls && vinyls.length > 0 ? (
                    vinyls.map((vinyl) => (
                        <div
                            key={vinyl.id}
                            onClick={() => !selectionMode && handleVinylClick(vinyl)}
                            className="cursor-pointer"
                        >
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
                    ))
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        {c('no_vinyls_found')}
                    </div>
                )}
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
                    }}
                />
            )}
        </div>
    );
}

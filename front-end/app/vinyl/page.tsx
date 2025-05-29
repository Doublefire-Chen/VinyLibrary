'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { BACKEND_URL } from '@/app/lib/config';
import type { Vinyl, PlayHistory } from '@/app/lib/definitions';
import Link from 'next/link';

function VinylDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [vinyl, setVinyl] = useState<Vinyl | null>(null);
    const [playHistory, setPlayHistory] = useState<PlayHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            setIsLoading(false);
            return;
        }

        const fetchVinylData = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/history/${id}`);
                const data = await res.json();
                setVinyl(data.vinyl);
                // Handle null play_history from API
                setPlayHistory(data.play_history || []);
            } catch (err) {
                console.error("Error loading vinyl detail:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVinylData();
    }, [id]);

    if (!id) return (
        <div className="flex items-center justify-center min-h-[300px] text-[#e14a4a] text-lg font-mono bg-[#f5f2ec]">
            No vinyl ID provided
        </div>
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[300px] text-[#b89f56] text-lg font-mono bg-[#f5f2ec]">
            Loading...
        </div>
    );

    if (!vinyl) return (
        <div className="flex items-center justify-center min-h-[300px] text-[#e14a4a] text-lg font-mono bg-[#f5f2ec]">
            Vinyl not found
        </div>
    );

    // Group tracklist by side for clearer UI
    const tracklistBySide: Record<string, typeof vinyl.tracklist> = {};
    vinyl.tracklist?.forEach(track => {
        if (!tracklistBySide[track.side]) tracklistBySide[track.side] = [];
        tracklistBySide[track.side].push(track);
    });

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
            {/* Back Button */}
            <div className="mb-4">
                <Link href="/">
                    <button className="flex items-center gap-2 bg-[#c9b370] text-black px-5 py-2 rounded-full text-sm font-medium shadow hover:bg-[#b89f56] transition">
                        <span className="text-xl">←</span>
                        Back to Home
                    </button>
                </Link>
            </div>

            {/* Vinyl Card */}
            <div className="rounded-2xl shadow-xl bg-gradient-to-br from-[#f5f2ec] to-[#ece7d8] border-2 border-[#c9b370] p-6 flex flex-col md:flex-row gap-6 items-center">
                <Image
                    src={vinyl.album_picture_url}
                    alt={vinyl.title}
                    width={224}
                    height={224}
                    className="w-56 h-56 object-cover rounded-xl border-4 border-[#c9b370] shadow"
                />
                <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-bold tracking-wider uppercase text-[#1a1a1a] mb-1">{vinyl.title}</h2>
                    <p className="text-md text-[#445a7c] font-semibold mb-2">{vinyl.artist} ・ {vinyl.year}</p>
                    <p className="mb-4 text-gray-800">{vinyl.description}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#2e2e2e] font-mono">
                        <span><strong>Type:</strong> {vinyl.vinyl_type}</span>
                        <span><strong>Number:</strong> {vinyl.vinyl_number}</span>
                        <span><strong>Price:</strong> {vinyl.price} {vinyl.currency}</span>
                        <span><strong>Times Played:</strong> {vinyl.play_num}</span>
                    </div>
                </div>
            </div>

            {/* Tracklist Card */}
            {vinyl.tracklist && vinyl.tracklist.length > 0 && (
                <div className="rounded-2xl shadow-lg bg-gradient-to-br from-[#f5f2ec] to-[#ece7d8] border border-[#c9b370] p-6">
                    <h3 className="text-xl font-bold tracking-wider uppercase text-[#445a7c] mb-4">Tracklist</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        {Object.keys(tracklistBySide).sort().map(side => (
                            <div key={side} className="flex-1">
                                <div className="text-lg font-semibold text-[#c9b370] mb-2">Side {side}</div>
                                <ol className="list-decimal list-inside space-y-2">
                                    {tracklistBySide[side]
                                        .sort((a, b) => a.order - b.order)
                                        .map(track => (
                                            <li key={track.order} className="flex justify-between items-center py-1 px-2 rounded-lg hover:bg-[#efe5c0]/60 transition">
                                                <span className="truncate">{track.title}</span>
                                                <span className="ml-4 text-sm font-mono text-[#445a7c]">{track.length}</span>
                                            </li>
                                        ))}
                                </ol>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Play History */}
            <div className="rounded-2xl shadow-lg bg-gradient-to-br from-[#f5f2ec] to-[#ece7d8] border border-[#c9b370] p-6">
                <h3 className="text-xl font-bold tracking-wider uppercase text-[#445a7c] mb-4">Play History</h3>
                {!playHistory || playHistory.length === 0 ? (
                    <p className="text-gray-500 font-mono">No play records yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {playHistory.map((entry) => {
                            const date = new Date(entry.play_time);
                            const localTime = new Intl.DateTimeFormat('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            }).format(date);
                            const match = entry.play_time.match(/([+-]\d{2}):?(\d{2})$/);
                            const tzOffset = match ? `UTC${match[1]}` : '';

                            return (
                                <li key={entry.id} className="border-b border-[#ece7d8] pb-1 last:border-none">
                                    <span className="font-semibold text-[#1a1a1a]">{entry.username}</span>
                                    <span className="text-[#445a7c]"> played on </span>
                                    <span className="font-mono">{localTime} {tzOffset}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default function VinylDetailPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[300px] text-[#b89f56] text-lg font-mono bg-[#f5f2ec]">
                Loading...
            </div>
        }>
            <VinylDetailContent />
        </Suspense>
    );
}
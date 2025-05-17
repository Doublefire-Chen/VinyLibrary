'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BACKEND_URL } from '@/app/lib/config';
import type { Vinyl, PlayHistory } from '@/app/lib/definitions';
import Link from 'next/link';

export default function VinylDetailPage() {
    const { id } = useParams();
    const [vinyl, setVinyl] = useState<Vinyl | null>(null);
    const [playHistory, setPlayHistory] = useState<PlayHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVinylData = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/history/${id}`);
                const data = await res.json();
                setVinyl(data.vinyl);
                setPlayHistory(data.play_history);
            } catch (err) {
                console.error("Error loading vinyl detail:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVinylData();
    }, [id]);

    if (isLoading) return <div className="text-center py-8">Loading...</div>;
    if (!vinyl) return <div className="text-center py-8">Vinyl not found</div>;

    return (
        <div className="max-w-3xl mx-auto p-4 space-y-6">
            <div className="mb-4">
                <Link href="/">
                    <button className="bg-gray-200 hover:bg-gray-300 text-black px-4 py-2 rounded">
                        ← Back to Home
                    </button>
                </Link>
            </div>

            <div className="border p-4 rounded shadow">
                <h2 className="text-xl font-semibold">{vinyl.title}</h2>
                <p className="text-sm text-gray-600">{vinyl.artist} ・ {vinyl.year}</p>
                <img src={vinyl.album_picture_url} alt={vinyl.title} className="w-full max-h-80 object-contain my-4" />
                <p>{vinyl.description}</p>
                <div className="mt-2 text-sm">
                    <p><strong>Type:</strong> {vinyl.vinyl_type}</p>
                    <p><strong>Number:</strong> {vinyl.vinyl_number}</p>
                    <p><strong>Price:</strong> {vinyl.price} {vinyl.currency}</p>
                    <p><strong>Times Played:</strong> {vinyl.play_num}</p>
                </div>
            </div>

            <div className="border p-4 rounded shadow">
                <h3 className="text-lg font-semibold mb-2">Play History</h3>
                {playHistory.length === 0 ? (
                    <p className="text-gray-500">No play records yet.</p>
                ) : (
                    <ul className="space-y-2">
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

                            // Extract timezone offset (e.g., +02:00) from the original ISO string
                            const match = entry.play_time.match(/([+-]\d{2}):?(\d{2})$/);
                            const tzOffset = match ? `UTC${match[1]}` : '';

                            return (
                                <li key={entry.id} className="border-b pb-1">
                                    Played by <strong>{entry.username}</strong> on {localTime} {tzOffset}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

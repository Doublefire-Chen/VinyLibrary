'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Vinyl } from '@/app/lib/definitions';
import { BACKEND_URL } from '@/app/lib/config'; // 引入后端地址
import { resourceLimits } from 'worker_threads';

export default function EditVinylPage() {
    const [vinyl, setVinyl] = useState<Vinyl | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        year: '',
        vinyl_type: '',
        vinyl_number: '',
        tracklist: [
            {
                side: '',
                order: 0,
                title: '',
                length: '',
            },
        ],
        album_picture_url: '',
        play_num: 0,
        timebought: '',
        price: 0,
        currency: '',
        description: '',
    });


    const params = useParams();
    const id = params?.id;
    const router = useRouter();

    useEffect(() => {
        const fetchVinyl = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/vinyls/${id}`, {
                    credentials: 'include',
                });
                if (res.status === 401) {
                    router.push('/login');
                    return;
                }
                const data = await res.json();
                setVinyl(data);
                setFormData(data);
            } catch (error) {
                console.error('Error fetching vinyl:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVinyl();
    }, [BACKEND_URL, id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch(`${BACKEND_URL}/api/vinyls/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData),
        });
        router.push('/manage');
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Edit Vinyl</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="album"
                    placeholder="Album Title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="artist"
                    placeholder="Artist"
                    value={formData.artist}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="year"
                    placeholder="Year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="album_picture_url"
                    placeholder="Album Picture URL"
                    value={formData.album_picture_url}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}

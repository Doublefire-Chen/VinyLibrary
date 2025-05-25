import { useState, useEffect } from 'react';
import { Vinyl } from '@/app/lib/definitions';
import { BACKEND_URL } from '@/app/lib/config';

export function useVinyls(requireCredentials = false) {
    const [vinyls, setVinyls] = useState<Vinyl[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchVinyls = async () => {
        try {
            //setIsLoading(true);
            const options = requireCredentials ? { credentials: 'include' as const } : {};
            const response = await fetch(`${BACKEND_URL}/api/vinyls`, options);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                throw new Error('Failed to fetch vinyls');
            }

            const data = await response.json();
            setVinyls(data);
            setError('');
        } catch (error: any) {
            console.error('Fetch error:', error);
            setError(error.message || 'Failed to load vinyls');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVinyls();
    }, []);

    const addVinyl = async (newVinyl: Omit<Vinyl, 'id'>) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/vinyls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newVinyl),
            });

            if (!res.ok) throw new Error('Failed to add vinyl');

            const data = await res.json();
            setVinyls(prev => [...prev, data]);
            return { success: true, data };
        } catch (err: any) {
            console.error('Error adding vinyl:', err);
            return { success: false, error: err.message };
        }
    };

    const updateVinyl = async (updatedVinyl: Vinyl) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/vinyls/${updatedVinyl.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(updatedVinyl),
            });

            if (!res.ok) throw new Error('Failed to update vinyl');

            setVinyls(prev => prev.map(v => v.id === updatedVinyl.id ? updatedVinyl : v));
            return { success: true };
        } catch (err: any) {
            console.error('Error updating vinyl:', err);
            return { success: false, error: err.message };
        }
    };

    const deleteVinyls = async (ids: number[]) => {
        try {
            for (const id of ids) {
                const res = await fetch(`${BACKEND_URL}/api/vinyls/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!res.ok) throw new Error(`Failed to delete vinyl ${id}`);
            }

            setVinyls(prev => prev.filter(v => !ids.includes(v.id)));
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting vinyls:', err);
            return { success: false, error: err.message };
        }
    };

    const recordPlay = async (userId: number, vinylId: number) => {
        try {
            const now = new Date();
            const playTime = now.toISOString();

            const res = await fetch(`${BACKEND_URL}/api/vinyls/play`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: userId,
                    vinyl_id: vinylId,
                    play_time: playTime
                }),
            });

            if (!res.ok) throw new Error('Failed to record play');

            // Refresh vinyl data after play
            await fetchVinyls();
            return { success: true };
        } catch (err: any) {
            console.error('Error recording play:', err);
            return { success: false, error: err.message };
        }
    };

    return {
        vinyls,
        isLoading,
        error,
        setVinyls,
        refetch: fetchVinyls,
        addVinyl,
        updateVinyl,
        deleteVinyls,
        recordPlay
    };
}

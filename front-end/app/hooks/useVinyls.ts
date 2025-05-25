import { useState, useEffect, useCallback } from 'react';
import { Vinyl } from '@/app/lib/definitions';
import { BACKEND_URL } from '@/app/lib/config';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

interface UseVinylsReturn {
    vinyls: Vinyl[];
    isLoading: boolean;
    error: string;
    setVinyls: (vinyls: Vinyl[]) => void;
    refetch: () => Promise<void>;
    addVinyl: (newVinyl: Omit<Vinyl, 'id'>) => Promise<ApiResponse<Vinyl>>;
    updateVinyl: (updatedVinyl: Vinyl) => Promise<ApiResponse>;
    deleteVinyls: (ids: number[]) => Promise<ApiResponse>;
    recordPlay: (userId: number, vinylId: number) => Promise<ApiResponse>;
}

interface PlayRequestBody {
    user_id: number;
    vinyl_id: number;
    play_time: string;
}

export function useVinyls(requireCredentials = false): UseVinylsReturn {
    const [vinyls, setVinyls] = useState<Vinyl[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const fetchVinyls = useCallback(async (): Promise<void> => {
        try {
            const options = requireCredentials ? { credentials: 'include' as const } : {};
            const response = await fetch(`${BACKEND_URL}/api/vinyls`, options);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized');
                }
                throw new Error('Failed to fetch vinyls');
            }

            const data: Vinyl[] = await response.json();
            setVinyls(data);
            setError('');
        } catch (fetchError: unknown) {
            const errorMessage = fetchError instanceof Error
                ? fetchError.message
                : 'Failed to load vinyls';
            console.error('Fetch error:', fetchError);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [requireCredentials]);

    useEffect(() => {
        fetchVinyls();
    }, [fetchVinyls]);

    const addVinyl = useCallback(
        async (newVinyl: Omit<Vinyl, 'id'>): Promise<ApiResponse<Vinyl>> => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/vinyls`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(newVinyl),
                });

                if (!response.ok) {
                    throw new Error('Failed to add vinyl');
                }

                const data: Vinyl = await response.json();
                setVinyls((prevVinyls) => [...prevVinyls, data]);
                return { success: true, data };
            } catch (addError: unknown) {
                const errorMessage = addError instanceof Error
                    ? addError.message
                    : 'Failed to add vinyl';
                console.error('Error adding vinyl:', addError);
                return { success: false, error: errorMessage };
            }
        },
        [],
    );

    const updateVinyl = useCallback(
        async (updatedVinyl: Vinyl): Promise<ApiResponse> => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/vinyls/${updatedVinyl.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(updatedVinyl),
                });

                if (!response.ok) {
                    throw new Error('Failed to update vinyl');
                }

                setVinyls((prevVinyls) =>
                    prevVinyls.map((vinyl) => (vinyl.id === updatedVinyl.id ? updatedVinyl : vinyl)),
                );
                return { success: true };
            } catch (updateError: unknown) {
                const errorMessage = updateError instanceof Error
                    ? updateError.message
                    : 'Failed to update vinyl';
                console.error('Error updating vinyl:', updateError);
                return { success: false, error: errorMessage };
            }
        },
        [],
    );

    const deleteVinyls = useCallback(
        async (ids: number[]): Promise<ApiResponse> => {
            try {
                // Use Promise.all for better performance and error handling
                const deletePromises = ids.map(async (id) => {
                    const response = await fetch(`${BACKEND_URL}/api/vinyls/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    if (!response.ok) {
                        throw new Error(`Failed to delete vinyl ${id}`);
                    }
                    return id;
                });

                await Promise.all(deletePromises);

                setVinyls((prevVinyls) => prevVinyls.filter((vinyl) => !ids.includes(vinyl.id)));
                return { success: true };
            } catch (deleteError: unknown) {
                const errorMessage = deleteError instanceof Error
                    ? deleteError.message
                    : 'Failed to delete vinyls';
                console.error('Error deleting vinyls:', deleteError);
                return { success: false, error: errorMessage };
            }
        },
        [],
    );

    const recordPlay = useCallback(
        async (userId: number, vinylId: number): Promise<ApiResponse> => {
            try {
                const now = new Date();
                const playTime = now.toISOString();

                const requestBody: PlayRequestBody = {
                    user_id: userId,
                    vinyl_id: vinylId,
                    play_time: playTime,
                };

                const response = await fetch(`${BACKEND_URL}/api/vinyls/play`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error('Failed to record play');
                }

                // Refresh vinyl data after play
                await fetchVinyls();
                return { success: true };
            } catch (playError: unknown) {
                const errorMessage = playError instanceof Error
                    ? playError.message
                    : 'Failed to record play';
                console.error('Error recording play:', playError);
                return { success: false, error: errorMessage };
            }
        },
        [fetchVinyls],
    );

    return {
        vinyls,
        isLoading,
        error,
        setVinyls,
        refetch: fetchVinyls,
        addVinyl,
        updateVinyl,
        deleteVinyls,
        recordPlay,
    };
}
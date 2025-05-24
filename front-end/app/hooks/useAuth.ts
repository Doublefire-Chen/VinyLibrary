import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/app/lib/config';

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loginStatus = localStorage.getItem('isLoggedIn');
        const storedUsername = localStorage.getItem('username');

        setIsLoggedIn(loginStatus === 'true');
        if (loginStatus === 'true' && storedUsername) {
            setUsername(storedUsername);
        }
        setIsLoading(false);
    }, []);

    const logout = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Logout failed');
                return false;
            }

            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('username');
            localStorage.removeItem('user_id');
            setIsLoggedIn(false);
            setUsername('');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return false;
        }
    };

    const requireAuth = (redirectPath = '/login', delay = 5000) => {
        if (!isLoggedIn) {
            const timer = setTimeout(() => {
                router.push(redirectPath);
            }, delay);
            return { isAuthenticated: false, cleanup: () => clearTimeout(timer) };
        }
        return { isAuthenticated: true, cleanup: () => { } };
    };

    return {
        isLoggedIn,
        username,
        isLoading,
        logout,
        requireAuth,
        setIsLoggedIn,
        setUsername
    };
}
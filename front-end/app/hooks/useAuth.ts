import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/app/lib/config';

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');

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
            router.push('/');
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

    const login = async () => {
        setError('');
        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('username', username);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('isLoggedIn', 'true');
                router.refresh();
                router.push('/manage');
            } else {
                localStorage.setItem('isLoggedIn', 'false');
                localStorage.removeItem('username');
                localStorage.removeItem('user_id');
                setError((await response.json()).message || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    const changepwd = async (
        oldPassword: string,
        newPassword: string,
        confirmPassword: string,
        onSuccess: () => void,
        onError: (msg: string) => void
    ) => {
        if (!oldPassword || !newPassword || !confirmPassword)
            return onError('Please fill in all fields');
        if (oldPassword === newPassword)
            return onError('New password must be different from old password');
        if (newPassword !== confirmPassword)
            return onError("New passwords don't match");

        try {
            const res = await fetch(`${BACKEND_URL}/api/changepwd`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
            });

            if (res.ok) {
                localStorage.removeItem('username');
                onSuccess();
            } else {
                const msg = await res.text();
                onError(`Error: ${msg}`);
            }
        } catch (err) {
            console.error('Password change error:', err);
            onError('Unexpected error occurred');
        }
    };

    return {
        isLoggedIn,
        username,
        password,
        isLoading,
        logout,
        requireAuth,
        login,
        setUsername,
        setPassword,
        error,
        setError,
        changepwd,
    };
}
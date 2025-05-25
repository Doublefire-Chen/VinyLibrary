import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/app/lib/config';

interface AuthReturn {
    isLoggedIn: boolean;
    username: string;
    password: string;
    isLoading: boolean;
    logout: () => Promise<boolean>;
    requireAuth: (redirectPath?: string, delay?: number) => { isAuthenticated: boolean; cleanup: () => void };
    login: () => Promise<void>;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    error: string;
    setError: (error: string) => void;
    changepwd: (
        oldPassword: string,
        newPassword: string,
        confirmPassword: string,
        onSuccess: () => void,
        onError: (msg: string) => void
    ) => Promise<void>;
}

export function useAuth(): AuthReturn {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [password, setPassword] = useState<string>('');

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

    const logout = useCallback(async (): Promise<boolean> => {
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
        } catch (logoutError) {
            console.error('Logout error:', logoutError);
            return false;
        }
    }, [router]);

    const requireAuth = useCallback(
        (redirectPath = '/login', delay = 5000) => {
            if (!isLoggedIn) {
                const timer = setTimeout(() => {
                    router.push(redirectPath);
                }, delay);
                return { isAuthenticated: false, cleanup: () => clearTimeout(timer) };
            }
            return { isAuthenticated: true, cleanup: () => { } };
        },
        [isLoggedIn, router]
    );

    const login = useCallback(async (): Promise<void> => {
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
                const responseData = await response.json();
                setError(responseData.message || 'Login failed');
            }
        } catch (loginError) {
            console.error('Login error:', loginError);
            setError('Network error');
        }
    }, [username, password, router]);

    const changepwd = useCallback(
        async (
            oldPassword: string,
            newPassword: string,
            confirmPassword: string,
            onSuccess: () => void,
            onError: (msg: string) => void
        ): Promise<void> => {
            if (!oldPassword || !newPassword || !confirmPassword) {
                onError('Please fill in all fields');
                return;
            }
            if (oldPassword === newPassword) {
                onError('New password must be different from old password');
                return;
            }
            if (newPassword !== confirmPassword) {
                onError("New passwords don't match");
                return;
            }

            try {
                const response = await fetch(`${BACKEND_URL}/api/changepwd`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword
                    }),
                });

                if (response.ok) {
                    localStorage.removeItem('username');
                    onSuccess();
                } else {
                    const errorMessage = await response.text();
                    onError(`Error: ${errorMessage}`);
                }
            } catch (changePasswordError) {
                console.error('Password change error:', changePasswordError);
                onError('Unexpected error occurred');
            }
        },
        []
    );

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
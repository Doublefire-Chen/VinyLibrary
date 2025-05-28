'use client';

import { useState } from 'react';
import { BACKEND_URL } from '@/app/lib/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import UserDropdown from '@/app/ui/UserDropdown';
import LoadingMessage from '@/app/ui/LoadingMessage';
import { useAuth } from '@/app/hooks/useAuth';

export default function RegisterPage() {
    const { t: c } = useTranslation('common');
    const { t: r } = useTranslation('register');
    const { isLoggedIn, username: authUsername, isLoading, logout } = useAuth();

    // Register form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogout = async () => {
        const success = await logout();
        if (!success) {
            console.error('Logout failed');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim() || !password) {
            setError(r('usernamePasswordRequired'));
            return;
        }
        if (password.length < 6) {
            setError(r('passwordMinLength'));
            return;
        }
        if (password !== confirm) {
            setError(r('passwordsDoNotMatch'));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Registration failed.');
            } else {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => router.push('/login'), 1500);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    if (isLoading) return <LoadingMessage />;

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
            {/* Header */}
            <header className="bg-[#1a1a1a] text-white py-6 px-6 shadow-md border-b-4 border-[#c9b370] relative">
                <WelcomeBan />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <ButtonLink href="/" variant="notcurrent">
                                {c('homepage')}
                            </ButtonLink>
                            <ButtonLink href="/manage" variant="notcurrent">
                                {c('manage')}
                            </ButtonLink>
                            <UserDropdown username={authUsername} onLogout={handleLogout} variant='notcurrent' />
                            <LanguageSwitcher />
                        </>
                    ) : (
                        <>
                            <ButtonLink href="/" variant="notcurrent">
                                {c('homepage')}
                            </ButtonLink>
                            <ButtonLink href="/login" variant="notcurrent">
                                {c('login')}
                            </ButtonLink>
                            <ButtonLink href="/register" variant="current">
                                {c('register')}
                            </ButtonLink>
                            <LanguageSwitcher />
                        </>
                    )}
                </div>
            </header>

            {/* Register Form */}
            <main className="flex justify-center items-start min-h-[60vh] py-12 px-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c9b370] p-8 mt-6">
                    <h2 className="text-2xl font-bold mb-6 text-center text-[#1a1a1a] uppercase">
                        {c('register')}
                    </h2>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block font-medium text-[#5a8f66] mb-1">{c('username')}</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-[#c9b370] rounded focus:outline-none focus:ring-2 focus:ring-[#c9b370]"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                disabled={loading}
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-[#5a8f66] mb-1">{c('password')}</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-[#c9b370] rounded focus:outline-none focus:ring-2 focus:ring-[#c9b370]"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-[#5a8f66] mb-1">{r('confirmPassword')}</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-[#c9b370] rounded focus:outline-none focus:ring-2 focus:ring-[#c9b370]"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        {success && <div className="text-green-600 text-sm">{success}</div>}
                        <button
                            type="submit"
                            className="w-full bg-[#c9b370] text-[#1a1a1a] font-bold px-4 py-2 rounded-full shadow hover:bg-[#b89f56] transition tracking-wide"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : c('register')}
                        </button>
                    </form>
                    <div className="text-sm text-center mt-4">
                        {c('already_have_account') || 'Already have an account?'}{' '}
                        <Link href="/login" className="text-[#445a7c] hover:underline">
                            {c('login')}
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
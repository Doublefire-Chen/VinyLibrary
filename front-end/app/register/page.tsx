'use client';

import { useState, useEffect } from 'react';
import { BACKEND_URL } from '@/app/lib/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import { UserIcon } from 'lucide-react';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';

export default function RegisterPage() {
    const { t: c } = useTranslation('common');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Auth status for showing Manage/Profile or Login/Register
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState('');
    const router = useRouter();

    useEffect(() => {
        const loginStatus = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loginStatus === 'true');
        if (loginStatus) {
            setUser(localStorage.getItem('username') || 'User');
        }
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Logout failed');
                return;
            }

            localStorage.setItem('isLoggedIn', 'false');
            localStorage.removeItem('username');
            localStorage.removeItem('user_id');
            setIsLoggedIn(false);
            setUser('');
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username.trim() || !password) {
            setError('Username and password are required.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/register`, {
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
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
            {/* Header (copied from homepage) */}
            <header className="bg-[#1a1a1a] text-white py-6 px-6 shadow-md border-b-4 border-[#c9b370] relative">
                <WelcomeBan />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <Link
                                href="/manage"
                                className="bg-[#c9b370] text-black px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#b89f56] transition"
                            >
                                {c('manage')}
                            </Link>
                            <div className="relative group">
                                <button className="flex items-center gap-1 bg-[#c9b370] text-black px-4 py-2 rounded-full text-sm tracking-wide font-medium shadow hover:bg-[#b89f56] transition">
                                    <UserIcon className="w-4 h-4" />
                                    {user}
                                </button>
                                <div
                                    className="absolute right-0 top-full mt-1 bg-white text-black rounded-md shadow-xl text-sm w-full whitespace-normal
                  invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 overflow-hidden border border-[#c9b370]"
                                    style={{
                                        boxShadow:
                                            "0 6px 24px 0 rgba(201,179,112,0.08), 0 1.5px 3px 0 rgba(0,0,0,0.06)",
                                        minWidth: "100%",
                                    }}
                                >
                                    <Link
                                        href="/profile"
                                        className="block px-4 py-2 hover:bg-[#f5f0e6] text-center w-full"
                                    >
                                        {c('profile')}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 hover:bg-[#f5f0e6] text-center"
                                    >
                                        {c('logout')}
                                    </button>
                                </div>
                            </div>
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
                            <label className="block font-medium text-[#5a8f66] mb-1">Username</label>
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
                            <label className="block font-medium text-[#5a8f66] mb-1">Password</label>
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
                            <label className="block font-medium text-[#5a8f66] mb-1">Confirm Password</label>
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

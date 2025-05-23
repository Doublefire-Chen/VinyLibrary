'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/app/lib/config';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import LoadingMessage from '@/app/ui/LoadingMessage';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { t: c } = useTranslation('common');
    const { t: l } = useTranslation('login');
    const router = useRouter();

    useEffect(() => {
        const loginStatus = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(loginStatus === 'true');
        setIsLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

    if (isLoading) {
        return <LoadingMessage />;
    }

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
            {/* Header (copy from homepage) */}
            <header className="bg-[#1a1a1a] text-white py-6 px-6 shadow-md border-b-4 border-[#c9b370] relative">
                <WelcomeBan />
                {/* Right side controls */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    {/* Always show Home link on login page */}
                    <ButtonLink href="/" variant="notcurrent">
                        {c('homepage')}
                    </ButtonLink>
                    <ButtonLink href="/login" variant="current">
                        {c('login')}
                    </ButtonLink>
                    <ButtonLink href="/register" variant="notcurrent">
                        {c('register')}
                    </ButtonLink>
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Login form */}
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white/90 shadow-2xl rounded-2xl p-8 w-full max-w-sm border border-[#c9b370] flex flex-col items-center mt-16">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 tracking-wider font-serif text-center">
                        {l('login_to_account')}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                        <input
                            type="text"
                            placeholder={c('username') || 'Username'}
                            className="bg-[#f5f2ec] border border-[#c9b370] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9b370] transition"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder={c('password') || 'Password'}
                            className="bg-[#f5f2ec] border border-[#c9b370] px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9b370] transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="bg-[#c9b370] text-[#1a1a1a] font-bold px-4 py-2 rounded-full shadow hover:bg-[#b89f56] transition tracking-wide"
                            type="submit"
                        >
                            {c('login')}
                        </button>
                        {error && (
                            <p className="text-red-500 text-center mt-2">{error}</p>
                        )}
                    </form>
                    <div className="text-sm text-center mt-4">
                        {c('no_account') || 'No account?'}{' '}
                        <Link href="/register" className="text-[#445a7c] hover:underline">
                            {c('register')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import LoadingMessage from '@/app/ui/LoadingMessage';
import Link from 'next/link';

export default function LoginPage() {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        isLoading,
        login,
    } = useAuth();
    const { t: c } = useTranslation('common');
    const { t: l } = useTranslation('login');

    if (isLoading) return <LoadingMessage />;

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
            <header className="bg-[#1a1a1a] text-white py-6 px-6 shadow-md border-b-4 border-[#c9b370] relative">
                <WelcomeBan />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <ButtonLink href="/" variant="notcurrent">{c('homepage')}</ButtonLink>
                    <ButtonLink href="/login" variant="current">{c('login')}</ButtonLink>
                    <ButtonLink href="/register" variant="notcurrent">{c('register')}</ButtonLink>
                    <LanguageSwitcher />
                </div>
            </header>

            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white/90 shadow-2xl rounded-2xl p-8 w-full max-w-sm border border-[#c9b370] flex flex-col items-center mt-16">
                    <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4 tracking-wider font-serif text-center">
                        {l('login_to_account')}
                    </h2>
                    <form onSubmit={(e) => { e.preventDefault(); login(); }} className="flex flex-col gap-4 w-full">
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

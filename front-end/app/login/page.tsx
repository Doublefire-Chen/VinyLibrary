'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import LoadingMessage from '@/app/ui/LoadingMessage';
import GithubIcon from '@/app/ui/GithubIcon';
import Link from 'next/link';
import { useState } from 'react';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    if (isLoading) return <LoadingMessage />;

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
            {/* Header */}
            <header className="bg-[#1a1a1a] text-white shadow-md border-b-4 border-[#c9b370] relative">
                {/* Desktop Header */}
                <div className="hidden md:block py-6 px-6">
                    <WelcomeBan />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
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
                        <GithubIcon />
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex-1">
                            <WelcomeBan />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="flex flex-col justify-center items-center w-8 h-8 bg-transparent border-none cursor-pointer"
                            aria-label="Toggle mobile menu"
                        >
                            <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                                }`}></span>
                            <span className={`block h-0.5 w-6 bg-white transition-all duration-300 my-1 ${isMobileMenuOpen ? 'opacity-0' : ''
                                }`}></span>
                            <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                                }`}></span>
                        </button>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    <div className={`transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="bg-[#2a2a2a] border-t border-[#c9b370]">
                            <nav className="flex flex-col">
                                <Link
                                    href="/"
                                    className="px-6 py-4 text-white hover:bg-[#3a3a3a] border-b border-[#c9b370]/20 font-medium text-center transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {c('homepage')}
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-6 py-4 text-white bg-[#4a90e2] border-b border-[#c9b370]/20 font-medium text-center"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {c('login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-6 py-4 text-white hover:bg-[#3a3a3a] border-b border-[#c9b370]/20 font-medium text-center transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {c('register')}
                                </Link>
                                <div className="px-6 py-4 flex justify-center">
                                    <LanguageSwitcher />
                                </div>
                                <div className="px-6 py-4 flex justify-center border-t border-[#c9b370]/20">
                                    <GithubIcon />
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            {/* Login Form */}
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-6">
                <div className="bg-white/90 shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-sm border border-[#c9b370] flex flex-col items-center mt-8 sm:mt-16">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-4 tracking-wider font-serif text-center">
                        {l('login_to_account')}
                    </h2>
                    <form onSubmit={(e) => { e.preventDefault(); login(); }} className="flex flex-col gap-4 w-full">
                        <input
                            type="text"
                            placeholder={c('username') || 'Username'}
                            className="bg-[#f5f2ec] border border-[#c9b370] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9b370] transition text-base"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder={c('password') || 'Password'}
                            className="bg-[#f5f2ec] border border-[#c9b370] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9b370] transition text-base"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="bg-[#c9b370] text-[#1a1a1a] font-bold px-4 py-3 rounded-full shadow hover:bg-[#b89f56] transition tracking-wide text-base"
                            type="submit"
                        >
                            {c('login')}
                        </button>
                        {error && (
                            <p className="text-red-500 text-center mt-2 text-sm">{error}</p>
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
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
// import Link from 'next/link'; // Not used directly
// import { UserIcon } from 'lucide-react'; // Not used directly
import { useAuth } from '@/app/hooks/useAuth';

import LoadingMessage from '@/app/ui/LoadingMessage';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import LoginRequired from '@/app/ui/LoginRequired';
import UserDropdown from '@/app/ui/UserDropdown';
import Footer from '@/app/ui/Footer';

export default function ProfilePage() {
    const {
        isLoading,
        isLoggedIn,
        username,
        logout,
        changepwd,
    } = useAuth();

    const router = useRouter();
    const { t: c } = useTranslation('common');
    const { t: p } = useTranslation('profile');

    const handleLogout = async () => {
        const success = await logout();
        if (!success) {
            // Handle logout error if needed
            console.error('Logout failed');
        }
    };

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        changepwd(oldPassword, newPassword, confirmPassword,
            () => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                alert(p('password_changed'));
                router.push('/login');
            },
            (msg) => alert(msg)
        );
    };

    if (isLoading) return <LoadingMessage />;
    if (!isLoggedIn) return <LoginRequired redirectDelay={5000} />;

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif flex flex-col">
            {/* Header Section */}
            {/* Mobile: py-4 px-4, text-center for WelcomeBan. Nav items flow below. */}
            {/* Desktop (md+): py-6 px-6, WelcomeBan aligns left. Nav items absolutely positioned. */}
            <header className="bg-[#1a1a1a] text-white py-4 px-4 md:py-6 md:px-6 shadow-md border-b-4 border-[#c9b370] relative text-center md:text-left flex-shrink-0">
                <WelcomeBan /> {/* On mobile, centered due to header's text-center. On md+, aligns left naturally. */}

                {/* Navigation Links Container */}
                {/* Mobile: margin-top, flex, wrap, centered items, smaller gap. */}
                {/* Desktop (md+): Reverts to original absolute positioning and styling. */}
                <div className="mt-4 flex flex-wrap justify-center items-center gap-2 
                                md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 md:mt-0 md:flex-nowrap md:items-center md:gap-3">
                    {isLoggedIn ? (
                        <>
                            <ButtonLink href="/" variant="notcurrent">{c('homepage')}</ButtonLink>
                            <ButtonLink href="/manage" variant="notcurrent">{c('manage')}</ButtonLink>
                            <UserDropdown username={username} onLogout={handleLogout} variant='current' />
                            <LanguageSwitcher />
                        </>
                    ) : (
                        <>
                            <ButtonLink href="/" variant="notcurrent">{c('homepage')}</ButtonLink>
                            <ButtonLink href="/login" variant="notcurrent">{c('login')}</ButtonLink>
                            <ButtonLink href="/register" variant="notcurrent">{c('register')}</ButtonLink>
                            <LanguageSwitcher />
                        </>
                    )}
                </div>
            </header>

            {/* Main Content Section */}
            {/* Mobile: smaller padding. */}
            {/* Desktop (md+): Reverts to original padding px-6 py-10. */}
            <main className="flex-1 px-4 py-8 md:px-6 md:py-10 bg-[#f8f6f1] flex flex-col items-center justify-center min-h-0">
                {/* Profile Card */}
                {/* Mobile: smaller padding. */}
                {/* Desktop (md+): Reverts to original padding py-8 px-7. */}
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c9b370] py-6 px-5 md:py-8 md:px-7">
                    {/* Mobile: smaller text, centered. Desktop (md+): original text size, left-aligned. */}
                    <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase text-[#1a1a1a] mb-2 text-center md:text-left">{c("profile")}</h1>
                    {/* Mobile: centered. Desktop (md+): left-aligned (implicitly). */}
                    <div className="h-[2px] bg-[#c9b370] w-12 mb-4 rounded-full mx-auto md:mx-0"></div>
                    {/* Mobile: smaller margin-bottom, centered. Desktop (md+): original margin, left-aligned. */}
                    <p className="mb-6 md:mb-7 text-[#2e2e2e] text-base text-center md:text-left">
                        <span className="font-medium">{c("username")}: </span>
                        <span className="font-bold">{username}</span>
                    </p>
                    {/* Mobile: smaller text, centered. Desktop (md+): original text size, left-aligned. */}
                    <h2 className="text-lg md:text-xl font-semibold tracking-wide text-[#445a7c] mb-3 text-center md:text-left">{p("change_password")}</h2>
                    {/* Mobile: smaller space-y. Desktop (md+): original space-y-5. */}
                    <form onSubmit={handleChangePassword} className="space-y-4 md:space-y-5">
                        {/* Mobile: smaller text. Desktop (md+): original text-base. */}
                        <input
                            type="password"
                            placeholder={p("current_password")}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full border border-[#c9b370] bg-[#f8f6f1] p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c9b370] text-sm md:text-base"
                            required
                        />
                        <input
                            type="password"
                            placeholder={p("new_password")}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-[#c9b370] bg-[#f8f6f1] p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c9b370] text-sm md:text-base"
                            required
                        />
                        <input
                            type="password"
                            placeholder={p("confirm_password")}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-[#c9b370] bg-[#f8f6f1] p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c9b370] text-sm md:text-base"
                            required
                        />
                        {/* Mobile: smaller text. Desktop (md+): original text size (implicitly base). */}
                        <button
                            type="submit"
                            className="w-full bg-[#c9b370] text-black font-semibold py-2.5 rounded-full tracking-wide shadow hover:bg-[#b89f56] transition-all outline-none focus:ring-2 focus:ring-[#c9b370] focus:ring-offset-2 vinyl-glossy text-sm md:text-base"
                        >
                            {p("change_password")}
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer - Always at bottom */}
            <Footer className="mt-auto flex-shrink-0" />
        </div>
    );
}
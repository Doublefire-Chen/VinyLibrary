'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { UserIcon } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';

import LoadingMessage from '@/app/ui/LoadingMessage';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import LoginRequired from '@/app/ui/LoginRequired';
import UserDropdown from '@/app/ui/UserDropdown';

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
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
            <header className="bg-[#1a1a1a] text-white py-6 px-6 shadow-md border-b-4 border-[#c9b370] relative">
                <WelcomeBan />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
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

            <main className="px-6 py-10 bg-[#f8f6f1] flex flex-col items-center">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c9b370] py-8 px-7">
                    <h1 className="text-3xl font-bold tracking-wide uppercase text-[#1a1a1a] mb-2">{c("profile")}</h1>
                    <div className="h-[2px] bg-[#c9b370] w-12 mb-4 rounded-full"></div>
                    <p className="mb-7 text-[#2e2e2e] text-base">
                        <span className="font-medium">{c("username")}: </span>
                        <span className="font-bold">{username}</span>
                    </p>
                    <h2 className="text-xl font-semibold tracking-wide text-[#445a7c] mb-3">{p("change_password")}</h2>
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <input
                            type="password"
                            placeholder={p("current_password")}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full border border-[#c9b370] bg-[#f8f6f1] p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c9b370] text-base"
                            required
                        />
                        <input
                            type="password"
                            placeholder={p("new_password")}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-[#c9b370] bg-[#f8f6f1] p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c9b370] text-base"
                            required
                        />
                        <input
                            type="password"
                            placeholder={p("confirm_password")}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-[#c9b370] bg-[#f8f6f1] p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c9b370] text-base"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-[#c9b370] text-black font-semibold py-2.5 rounded-full tracking-wide shadow hover:bg-[#b89f56] transition-all outline-none focus:ring-2 focus:ring-[#c9b370] focus:ring-offset-2 vinyl-glossy"
                        >
                            {p("change_password")}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}

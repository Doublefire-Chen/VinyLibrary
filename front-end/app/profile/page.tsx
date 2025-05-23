'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { UserIcon } from 'lucide-react';
import LoadingMessage from '@/app/ui/LoadingMessage';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import LoginRequired from '@/app/ui/LoginRequired';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginWarning, setShowLoginWarning] = useState(false);
    const router = useRouter();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const { t: c } = useTranslation('common');
    const { t: p } = useTranslation('profile');

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword == '' || oldPassword == '' || confirmPassword == '') {
            alert('Please fill in all fields');
            return;
        }
        if (newPassword === oldPassword) {
            alert('New password must be different from old password');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match");
            return;
        }
        try {
            const res = await fetch(`${backendUrl}/api/changepwd`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                }),
            });
            if (res.ok) {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                alert(p('password_changed'));
                localStorage.removeItem('username');
                router.push('/login');
            } else {
                const errMsg = await res.text();
                alert(`Error: ${errMsg}`);
            }
        } catch (err) {
            console.error('Error changing password:', err);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch(`${backendUrl}/api/logout`, {
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
            setUsername('');
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    useEffect(() => {
        const loginStatus = localStorage.getItem('isLoggedIn');
        const storedUsername = localStorage.getItem('username');

        // Always set loading to false first
        setIsLoading(false);

        // Check if user is logged in
        if (loginStatus !== 'true' || !storedUsername) {
            // User is not logged in, show warning and redirect after delay
            setShowLoginWarning(true);
            const redirectTimer = setTimeout(() => {
                router.push('/login');
            }, 5000); // 5 second delay

            return () => clearTimeout(redirectTimer);
        }

        setUsername(storedUsername);
        setIsLoggedIn(true);
    }, [router]);

    if (isLoading) {
        return <LoadingMessage />;
    }

    // Show login warning if user is not authenticated
    if (showLoginWarning) {
        return (
            <LoginRequired
                redirectDelay={5000}
            />
        );
    }

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

                            <div className="relative group">
                                <button className="flex items-center gap-1 bg-[#c9b370] text-black px-4 py-2 rounded-full text-sm tracking-wide font-medium shadow hover:bg-[#b89f56] transition">
                                    <UserIcon className="w-4 h-4" />
                                    {username}
                                </button>
                                <div
                                    className="absolute right-0 top-full mt-1 
                                    bg-white text-black rounded-md shadow-xl text-sm w-full whitespace-normal
                                    invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 overflow-hidden border border-[#c9b370]"
                                    style={{
                                        boxShadow: "0 6px 24px 0 rgba(201,179,112,0.08), 0 1.5px 3px 0 rgba(0,0,0,0.06)",
                                        minWidth: "100%"
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
                            <ButtonLink href="/register" variant="notcurrent">
                                {c('register')}
                            </ButtonLink>
                            <LanguageSwitcher />
                        </>
                    )}
                </div>
            </header>

            {/* Profile Content */}
            <main className="px-6 py-10 bg-[#f8f6f1] flex flex-col items-center">
                {/* --- Profile Card --- */}
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
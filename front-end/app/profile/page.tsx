'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import LoadingMessage from '@/app/ui/LoadingMessage';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
                alert('Password changed successfully, please log in again');
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

    useEffect(() => {
        setUsername(localStorage.getItem('username') || '');
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <LoadingMessage />;
    }

    return (
        <div className="min-h-screen bg-[#f8f6f1] font-serif flex flex-col items-center px-4">
            {/* --- Menu Bar --- */}
            <nav className="w-full bg-[#1a1a1a] border-b-4 border-[#c9b370] shadow-sm py-2 px-6 mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-[#c9b370] text-lg font-bold tracking-wide uppercase hover:underline">
                        {c('homepage')}
                    </Link>
                    <Link href="/manage" className="text-white text-base font-medium tracking-wide hover:text-[#c9b370] transition">
                        {c('manage')}
                    </Link>
                    <Link href="/profile" className="text-white text-base font-medium tracking-wide hover:text-[#c9b370] transition">
                        {c('profile')}
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[#c9b370] text-base tracking-wide">{username}</span>
                    <button
                        className="bg-[#c9b370] text-black px-3 py-1 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#b89f56] transition-all"
                        onClick={() => {
                            localStorage.setItem('isLoggedIn', 'false');
                            localStorage.removeItem('username');
                            localStorage.removeItem('user_id');
                            router.push('/login');
                        }}
                    >
                        {c('logout')}
                    </button>
                </div>
            </nav>

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
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
    const username = localStorage.getItem('username');
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

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4">{c("profile")}</h1>
            <p className="mb-6">{c("username")}: <strong>{username}</strong></p>
            <h2 className="text-xl font-semibold mb-2">{p("change_password")}</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
                <input
                    type="password"
                    placeholder={p("current_password")}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder={p("new_password")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder={p("confirm_password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {p("change_password")}
                </button>
            </form>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const username = localStorage.getItem('username');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const router = useRouter();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
            <h1 className="text-2xl font-bold mb-4">Profile</h1>
            <p className="mb-6">Username: <strong>{username}</strong></p>
            <h2 className="text-xl font-semibold mb-2">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
                <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Change Password
                </button>
            </form>
        </div>
    );
}

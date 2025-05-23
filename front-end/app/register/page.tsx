'use client';

import { useState } from 'react';
import { BACKEND_URL } from '@/app/lib/config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const { t: c } = useTranslation('common');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
        <div className="min-h-screen bg-[#f8f6f1] flex flex-col items-center justify-center font-serif">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c9b370] p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#1a1a1a] uppercase">{c('register')}</h2>
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
                        className="w-full bg-[#c9b370] text-black py-2 rounded-full font-medium hover:bg-[#b89f56] transition"
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
        </div>
    );
}

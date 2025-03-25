'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/app/lib/config'; // 引入后端地址

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // important! so cookies (session) are sent
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                localStorage.setItem('username', username);
                router.push('/manage'); // redirect to management page
            } else {
                const data = await response.json();
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div>
            <div className="bg-black text-white text-center py-2 relative">
                <div className="flex flex-col items-center gap-0">
                    <h1 className="text-2xl font-semibold leading-light">
                        Welcome to Vinyl Collection
                    </h1>
                    <p className="text-sm font-normal leading-none">
                        Explore a collection of timeless vinyl records.
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl mb-4">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
                    <input
                        type="text"
                        placeholder="Username"
                        className="border p-2 rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-2 rounded"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="bg-black text-white p-2 rounded hover:bg-gray-700 transition-colors duration-200"
                        type="submit"
                    >
                        Login
                    </button>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                </form>
            </div>
        </div>
    );
}

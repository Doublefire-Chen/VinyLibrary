'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface LoginRequiredProps {
    redirectDelay?: number;
    message?: string;
    onRedirect?: () => void;
}

export default function LoginRequired({
    redirectDelay = 5000,
    message,
    onRedirect
}: LoginRequiredProps) {
    const [countdown, setCountdown] = useState(Math.ceil(redirectDelay / 1000));
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const { t: c } = useTranslation('common');

    useEffect(() => {
        setMounted(true);  // Set mounted state to true on client-side after initial render

        const countdownInterval = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        const redirectTimer = setTimeout(() => {
            onRedirect?.();
            router.push('/login');
        }, redirectDelay);

        return () => {
            clearInterval(countdownInterval);
            clearTimeout(redirectTimer);
        };
    }, [router, redirectDelay, onRedirect]);

    if (!mounted) {
        // Return minimal structure to match SSR
        return (
            <div className="min-h-screen bg-[#f8f6f1] flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl border border-[#c9b370] py-12 px-8 text-center max-w-md">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">Login Required</h1>
                    <p className="text-[#666] mb-4">You need to be logged in to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-[#c9b370] py-12 px-8 text-center max-w-md">
                <div className="text-6xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">
                    {c('login_required')}
                </h1>
                <p className="text-[#666] mb-4">
                    {message || c('login_required_message')}
                </p>
                <p className="text-sm text-[#888] mb-4">
                    {c('redirecting_in')} {countdown} {c('seconds')}...
                </p>
                <div className="mt-4">
                    <Link
                        href="/login"
                        className="inline-block bg-[#c9b370] text-black px-6 py-2 rounded-full text-sm font-medium hover:bg-[#b89f56] transition"
                    >
                        {c('go_to_login')}
                    </Link>
                </div>
            </div>
        </div>
    );
}

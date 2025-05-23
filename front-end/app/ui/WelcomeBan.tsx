'use client'
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

export default function WelcomeBan() {
    const { t: c } = useTranslation('common');
    return (
        <Link
            href="/"
            className="block text-center space-y-1 cursor-pointer select-none hover:opacity-90 transition"
            aria-label={c('welcome')}
        >
            <h1 className="text-3xl font-bold tracking-wide uppercase">
                {c('welcome')}
            </h1>
            <p className="text-sm italic text-[#e3e3e3] tracking-wide">
                {c('welcome_message')}
            </p>
        </Link>
    );
}
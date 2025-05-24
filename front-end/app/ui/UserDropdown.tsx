'use client';

import React from 'react';
import Link from 'next/link';
import { UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface UserDropdownProps {
    username: string;
    onLogout: () => void;
    variant?: 'current' | 'notcurrent';
    className?: string;
    [x: string]: any; // Allow other props (e.g. onClick, etc.)
}

export default function UserDropdown({ username, onLogout, className = '', variant = 'notcurrent', ...props }: UserDropdownProps) {
    const { t: c } = useTranslation('common');
    const baseStyle = "flex items-center gap-1 px-4 py-2 rounded-full text-sm tracking-wide font-medium shadow transition";
    const styles = {
        notcurrent:
            'bg-[#c9b370] text-black hover:bg-[#b89f56]',
        current:
            'bg-[#445a7c] text-white hover:bg-[#394e6a]',
    };
    return (
        <div className="relative group">
            <button className={clsx(baseStyle, styles[variant], className)} {...props}>
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
                    onClick={onLogout}
                    className="w-full px-4 py-2 hover:bg-[#f5f0e6] text-center"
                >
                    {c('logout')}
                </button>
            </div>
        </div>
    );
}
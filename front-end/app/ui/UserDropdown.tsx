'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface UserDropdownProps {
    username: string;
    onLogout: () => void;
    variant?: 'current' | 'notcurrent';
    className?: string;
    [x: string]: unknown;
}

export default function UserDropdown({
    username,
    onLogout,
    className = '',
    variant = 'notcurrent',
    ...props
}: UserDropdownProps) {
    const { t: c } = useTranslation('common');
    const [menuOpen, setMenuOpen] = useState(false);

    const baseStyle =
        'flex items-center gap-1 px-4 py-2 rounded-full text-sm tracking-wide font-medium shadow transition';
    const styles = {
        notcurrent: 'bg-[#c9b370] text-black hover:bg-[#b89f56]',
        current: 'bg-[#445a7c] text-white hover:bg-[#394e6a]',
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
        >
            <button
                className={clsx(baseStyle, styles[variant], className)}
                {...props}
            >
                <UserIcon className="w-4 h-4" />
                {username}
            </button>

            {menuOpen && (
                <div
                    className="absolute right-0 top-full mt-1 bg-white text-black rounded-md shadow-xl text-sm w-full z-50 border border-[#c9b370]"
                    style={{
                        boxShadow: '0 6px 24px 0 rgba(201,179,112,0.08), 0 1.5px 3px 0 rgba(0,0,0,0.06)',
                        minWidth: '100%',
                    }}
                >
                    <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-[#f5f0e6] text-center w-full"
                        onClick={() => setMenuOpen(false)}
                    >
                        {c('profile')}
                    </Link>
                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            onLogout();
                        }}
                        className="w-full px-4 py-2 hover:bg-[#f5f0e6] text-center"
                    >
                        {c('logout')}
                    </button>
                </div>
            )}
        </div>
    );
}
'use client';

import React, { useState, useRef } from 'react';
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
    const buttonRef = useRef<HTMLButtonElement>(null);

    const baseStyle =
        'flex items-center gap-1 px-4 py-2 rounded-full text-sm tracking-wide font-medium shadow transition focus:outline-none focus:ring-2';
    const styles = {
        notcurrent: 'bg-[#c9b370] text-black hover:bg-[#b89f56] focus:ring-[#c9b370]',
        current: 'bg-[#445a7c] text-white hover:bg-[#394e6a] focus:ring-[#445a7c]',
    };

    // Handle keyboard and blur for accessibility
    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setMenuOpen(false);
        }
    };

    return (
        <div
            className={`relative z-30 ${className}`}
            tabIndex={0}
            onBlur={handleBlur}
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
        >
            <button
                ref={buttonRef}
                className={clsx(baseStyle, styles[variant])}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                style={{ height: '36px' }}
                {...props}
            >
                <UserIcon className="w-4 h-4" />
                {username}
            </button>

            {/* Dropdown */}
            <div
                className={`absolute right-0 mt-1 bg-white font-serif rounded-xl border border-[#c9b370] shadow-2xl py-1 z-40
                transition-all duration-150 ${menuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
                style={{
                    boxShadow: '0 4px 20px 0 rgba(201,179,112,0.13)',
                    minWidth: buttonRef.current ? buttonRef.current.offsetWidth + 'px' : '120px'
                }}
                role="menu"
            >
                <Link
                    href="/profile"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide hover:bg-[#f5f0e6] text-[#222] transition rounded-lg"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                >
                    <span>{c('profile')}</span>
                </Link>
                <button
                    onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide hover:bg-[#f5f0e6] text-[#222] transition rounded-lg"
                    role="menuitem"
                    tabIndex={0}
                >
                    <span>{c('logout')}</span>
                </button>
            </div>
        </div>
    );
}
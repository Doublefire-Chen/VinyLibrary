'use client';

import Link from 'next/link';
import React from 'react';
import clsx from 'clsx';

interface ButtonLinkProps {
    href: string;
    children: React.ReactNode;
    variant?: 'current' | 'notcurrent';
    className?: string;
    [x: string]: any; // Allow other props (e.g. onClick, etc.)
}

export default function ButtonLink({
    href,
    children,
    variant = 'notcurrent',
    className = '',
    ...props
}: ButtonLinkProps) {
    const baseStyle =
        'px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow transition';

    const styles = {
        notcurrent:
            'bg-[#c9b370] text-black hover:bg-[#b89f56]',
        current:
            'bg-[#445a7c] text-white hover:bg-[#394e6a]',
    };

    return (
        <Link
            href={href}
            className={clsx(baseStyle, styles[variant], className)}
            {...props}
        >
            {children}
        </Link>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LoadingMessage = () => {
    const { t: c } = useTranslation('common');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="text-center py-10 text-[#444] text-sm font-serif tracking-wider bg-[#f5f2ec]">
            {c('loading')}
        </div>
    );
};

export default LoadingMessage;

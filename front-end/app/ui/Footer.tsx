// app/ui/Footer.tsx
'use client';
import VersionDisplay from './VersionDisplay';
import GithubIcon from './GithubIcon';

interface FooterProps {
    className?: string;
    year?: number;
}

export default function Footer({
    className = '',
    year = new Date().getFullYear()
}: FooterProps) {
    return (
        <footer className={`bg-[#1a1a1a] text-white py-4 px-6 border-t-4 border-[#c9b370] ${className}`}>
            <div className="flex justify-between items-center">
                {/* Left side - Year */}
                <span className="text-sm text-gray-400">
                    © {year}
                </span>

                {/* Right side - GitHub and Version */}
                <div className="flex items-center gap-4">
                    <GithubIcon />
                    <VersionDisplay className="text-gray-400 hover:text-[#c9b370] transition-colors" />
                </div>
            </div>
        </footer>
    );
}
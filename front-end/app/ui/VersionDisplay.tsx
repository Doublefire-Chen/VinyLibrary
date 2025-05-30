// app/ui/VersionDisplay.tsx
'use client';
import { useEffect, useState } from 'react';

interface VersionInfo {
    version: string;
    buildTime: string;
    gitHash: string;
}

interface VersionDisplayProps {
    className?: string;
    showDetails?: boolean;
}

export default function VersionDisplay({
    className = '',
    showDetails = false
}: VersionDisplayProps) {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/version.json')
            .then(res => res.json())
            .then((data: VersionInfo) => {
                setVersionInfo(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.warn('Could not load version info:', error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <span className={`text-xs text-gray-400 ${className}`}>
                Loading...
            </span>
        );
    }

    if (!versionInfo) {
        return null;
    }

    const formatBuildTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        } catch {
            return 'Unknown';
        }
    };

    // Clean version string - remove 'v' prefix if it exists
    const cleanVersion = versionInfo.version.replace(/^v/, '');

    if (showDetails) {
        return (
            <div className={`text-xs text-gray-400 space-y-1 ${className}`}>
                <div className="font-medium">v{cleanVersion}</div>
                <div>Compiled at: {formatBuildTime(versionInfo.buildTime)}</div>
                <div className="font-mono">#{versionInfo.gitHash}</div>
            </div>
        );
    }

    return (
        <div className={`text-xs text-gray-400 ${className}`}>
            <div className="flex items-center gap-2">
                <span className="hover:text-[#c9b370] transition-colors cursor-help"
                    title={`Version: ${cleanVersion}`}>
                    v{cleanVersion}
                </span>
                <span className="text-gray-500">•</span>
                <span className="font-mono hover:text-[#c9b370] transition-colors cursor-help"
                    title={`Git commit: ${versionInfo.gitHash}`}>
                    #{versionInfo.gitHash}
                </span>
                <span className="text-gray-500">•</span>
                <span className="hover:text-[#c9b370] transition-colors cursor-help"
                    title={`Compiled at: ${formatBuildTime(versionInfo.buildTime)}`}>
                    compiled at {formatBuildTime(versionInfo.buildTime)}
                </span>
            </div>
        </div>
    );
}
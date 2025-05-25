// Mobile Responsive Refactored Manage Page (page.tsx)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Vinyl } from '@/app/lib/definitions';
import VinylItem from '@/app/ui/manage/VinylItem';
import EditVinylModal from '@/app/ui/manage/EditVinylModal';
import Link from 'next/link';
import AddVinylModal from '@/app/ui/manage/AddVinylModal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import WelcomeBan from '@/app/ui/WelcomeBan';
import LoginRequired from '@/app/ui/LoginRequired';
import UserDropdown from '@/app/ui/UserDropdown';
import { useAuth } from '@/app/hooks/useAuth';
import LoadingMessage from '@/app/ui/LoadingMessage';
import MenuDropdown from '@/app/ui/MenuDropdown';

// Separate component that only renders when authenticated
function AuthenticatedManageContent() {
    const [selectedVinyls, setSelectedVinyls] = useState<number[]>([]);
    const [selectedVinylForEdit, setSelectedVinylForEdit] = useState<Vinyl | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [addNewVinyl, setAddNewVinyl] = useState(false);

    const { t: m } = useTranslation('manage');
    const { t: c } = useTranslation('common');
    const { username, logout } = useAuth();

    // Import hooks here so they only run when component is mounted (user is authenticated)
    const { useVinyls } = require('@/app/hooks/useVinyls');
    const { useBackup } = require('@/app/hooks/useBackup');

    const {
        vinyls,
        isLoading,
        error,
        deleteVinyls,
        addVinyl,
        updateVinyl,
        recordPlay
    } = useVinyls(true);

    const { createBackup, restoreBackup } = useBackup();

    const handleDeleteSelected = async () => {
        if (!confirm('Are you sure you want to delete the selected vinyls?')) return;

        const result = await deleteVinyls(selectedVinyls);
        if (result.success) {
            setSelectedVinyls([]);
            setSelectionMode(false);
        } else {
            alert('Failed to delete selected vinyls.');
        }
    };

    const toggleSelectVinyl = (id: number) => {
        setSelectedVinyls((prev) =>
            prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id]
        );
    };

    const handleVinylClick = (vinyl: Vinyl) => {
        if (!selectionMode) {
            setSelectedVinylForEdit(vinyl);
        }
    };

    const handlePlay = async (userId: number, vinylId: number) => {
        const result = await recordPlay(userId, vinylId);
        if (!result.success) {
            console.error('Error recording play:', result.error);
        }
    };

    const handleBackup = async () => {
        const result = await createBackup();
        if (!result.success) {
            alert('Backup failed');
        }
    };

    const handleRestore = async () => {
        const result = await restoreBackup();
        if (result.success) {
            alert(m('restore_success') || 'Restore successful');
            window.location.reload();
        } else {
            alert(m('restore_failed') || 'Restore failed');
        }
    };

    const handleLogout = async () => {
        const success = await logout();
        if (!success) {
            console.error('Logout failed');
        }
    };

    const handleAddVinyl = async (newVinyl: Omit<Vinyl, 'id'>) => {
        const result = await addVinyl(newVinyl);
        if (result.success) {
            setAddNewVinyl(false);
            alert('Vinyl added successfully.');
        } else {
            alert('Failed to add vinyl.');
        }
    };

    const handleUpdateVinyl = async (updatedVinyl: Vinyl) => {
        const result = await updateVinyl(updatedVinyl);
        if (result.success) {
            setSelectedVinylForEdit(null);
            alert('Vinyl updated successfully.');
        } else {
            alert('Failed to update vinyl.');
        }
    };

    // Show loading state while vinyls are being fetched
    if (isLoading) {
        return (
            <LoadingMessage />
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f1] p-3 sm:p-6 font-serif text-[#2e2e2e]">
            {error && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded border border-red-300 text-sm">
                    {error}
                </div>
            )}
            <div className="mb-2">
                <WelcomeBan />
            </div>

            {/* Mobile-first header layout with improved z-index management */}
            <div className="mb-6 pb-4 border-b border-[#c9b370] relative">
                <div className="flex flex-col gap-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase text-center">
                        {m('manage')}
                    </h1>

                    {/* Action buttons - responsive layout with proper spacing for dropdowns */}
                    <div className="flex flex-col gap-6 items-center justify-center">
                        {!selectionMode ? (
                            <>
                                {/* Top row - main actions with extra spacing for mobile dropdowns */}
                                <div className="flex flex-col gap-6 items-center justify-center w-full max-w-md sm:max-w-none sm:flex-row sm:gap-6">
                                    {/* Vinyl Actions Dropdown */}
                                    <div className="w-full sm:w-auto flex justify-center relative" style={{ zIndex: 1000 }}>
                                        <MenuDropdown
                                            title={m('vinyl_actions') || 'Vinyl Actions'}
                                            items={[
                                                {
                                                    title: m('select'),
                                                    onClick: () => setSelectionMode(true),
                                                },
                                                {
                                                    title: m('add_new_vinyl'),
                                                    onClick: () => setAddNewVinyl(true),
                                                },
                                            ]}
                                        />
                                    </div>

                                    {/* Backup & Restore Dropdown */}
                                    <div className="w-full sm:w-auto flex justify-center relative" style={{ zIndex: 999 }}>
                                        <MenuDropdown
                                            title={m('backup_restore') || 'Backup & Restore'}
                                            items={[
                                                {
                                                    title: m('backup'),
                                                    onClick: handleBackup,
                                                },
                                                {
                                                    title: m('restore'),
                                                    onClick: handleRestore,
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>

                                {/* Bottom row - user settings with spacing */}
                                <div className="flex flex-col gap-6 items-center justify-center w-full max-w-md sm:max-w-none sm:flex-row sm:gap-6">
                                    <div className="w-full sm:w-auto flex justify-center relative" style={{ zIndex: 998 }}>
                                        <UserDropdown username={username} onLogout={handleLogout} />
                                    </div>
                                    <div className="w-full sm:w-auto flex justify-center relative" style={{ zIndex: 997 }}>
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Selection Mode Actions - centered with proper spacing */}
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                                    {selectedVinyls.length > 0 && (
                                        <button
                                            onClick={handleDeleteSelected}
                                            className="bg-[#aa4a44] text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#993d38] transition-all outline-none focus:ring-2 focus:ring-[#aa4a44] focus:ring-offset-2 flex items-center gap-2 w-full sm:w-auto justify-center"
                                        >
                                            <span>
                                                {m('delete_selected')} ({selectedVinyls.length})
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setSelectionMode(false);
                                            setSelectedVinyls([]);
                                        }}
                                        className="bg-[#888] text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#777] transition-all outline-none focus:ring-2 focus:ring-[#888] focus:ring-offset-2 flex items-center gap-2 w-full sm:w-auto justify-center"
                                    >
                                        <span>✖️</span>
                                        <span>{m('cancel')}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Responsive vinyl grid - centered with extra top margin for dropdown clearance */}
            <div className="flex justify-center mt-16 sm:mt-6">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 max-w-7xl">
                    {vinyls && vinyls.length > 0 ? (
                        vinyls.map((vinyl: Vinyl) => (
                            <div
                                key={vinyl.id}
                                onClick={() => !selectionMode && handleVinylClick(vinyl)}
                                className="cursor-pointer flex justify-center"
                            >
                                <VinylItem
                                    vinyl={vinyl}
                                    isSelected={selectedVinyls.includes(vinyl.id)}
                                    onToggleSelect={() => toggleSelectVinyl(vinyl.id)}
                                    selectionMode={selectionMode}
                                    onClickPlay={(e) => {
                                        e.stopPropagation();
                                        handlePlay(parseInt(localStorage.getItem('user_id') || '0'), vinyl.id);
                                    }}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            <p className="text-base sm:text-lg">{c('no_vinyls_found')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals remain the same */}
            {
                selectedVinylForEdit && (
                    <EditVinylModal
                        vinyl={selectedVinylForEdit}
                        onClose={() => setSelectedVinylForEdit(null)}
                        onSave={handleUpdateVinyl}
                    />
                )
            }

            {
                addNewVinyl && (
                    <AddVinylModal
                        onClose={() => setAddNewVinyl(false)}
                        onSave={handleAddVinyl}
                    />
                )
            }
        </div >
    );
}

export default function ManagePage() {
    const router = useRouter();
    const { t: c } = useTranslation('common');
    const { isLoggedIn, isLoading, requireAuth } = useAuth();

    useEffect(() => {
        const authCheck = requireAuth('/login', 5000);
        return authCheck.cleanup;
    }, [isLoggedIn, requireAuth]);

    // Show loading while authentication status is being determined
    if (isLoading) {
        return (
            <LoadingMessage />
        );
    }

    // Only render the main content if user is logged in
    if (!isLoggedIn) {
        return (
            <LoginRequired
                message={c('login_required_message')}
                redirectDelay={5000}
                onRedirect={() => router.push('/login')}
            />
        );
    }

    // User is authenticated, render the main manage content
    return <AuthenticatedManageContent />;
}
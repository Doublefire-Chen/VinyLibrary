// Mobile Responsive Refactored Manage Page (page.tsx)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Vinyl } from '@/app/lib/definitions';
import VinylItem from '@/app/ui/manage/VinylItem';
import EditVinylModal from '@/app/ui/manage/EditVinylModal';
import AddVinylModal from '@/app/ui/manage/AddVinylModal';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import WelcomeBan from '@/app/ui/WelcomeBan';
import LoginRequired from '@/app/ui/LoginRequired';
import UserDropdown from '@/app/ui/UserDropdown';
import Footer from '@/app/ui/Footer';
import { useAuth } from '@/app/hooks/useAuth';
import LoadingMessage from '@/app/ui/LoadingMessage';
import MenuDropdown from '@/app/ui/MenuDropdown';
import { useVinyls } from '@/app/hooks/useVinyls';
import { useBackup } from '@/app/hooks/useBackup';

interface MenuItem {
    title: string;
    onClick: () => void;
}

// Separate component that only renders when authenticated
function AuthenticatedManageContent() {
    const [selectedVinyls, setSelectedVinyls] = useState<number[]>([]);
    const [selectedVinylForEdit, setSelectedVinylForEdit] = useState<Vinyl | null>(null);
    const [selectionMode, setSelectionMode] = useState(false);
    const [addNewVinyl, setAddNewVinyl] = useState(false);

    const { t: m } = useTranslation('manage');
    const { t: c } = useTranslation('common');
    const { username, logout } = useAuth();

    const {
        vinyls,
        isLoading,
        error,
        deleteVinyls,
        addVinyl,
        updateVinyl,
        recordPlay,
    } = useVinyls(true);

    const { createBackup, restoreBackup } = useBackup();

    const showAlert = useCallback((message: string) => {
        // Using window.alert to make ESLint happy with explicit global reference
        window.alert(message);
    }, []);

    const showConfirm = useCallback((message: string): boolean => {
        // Using window.confirm to make ESLint happy with explicit global reference
        return window.confirm(message);
    }, []);

    const getUserId = useCallback((): number => {
        const userId = localStorage.getItem('user_id');
        return userId ? parseInt(userId, 10) : 0;
    }, []);

    const handleDeleteSelected = useCallback(async () => {
        if (!showConfirm('Are you sure you want to delete the selected vinyls?')) {
            return;
        }

        const result = await deleteVinyls(selectedVinyls);
        if (result.success) {
            setSelectedVinyls([]);
            setSelectionMode(false);
        } else {
            showAlert('Failed to delete selected vinyls.');
        }
    }, [deleteVinyls, selectedVinyls, showConfirm, showAlert]);

    const toggleSelectVinyl = useCallback((id: number) => {
        setSelectedVinyls((prev) =>
            prev.includes(id) ? prev.filter((vid) => vid !== id) : [...prev, id],
        );
    }, []);

    const handleVinylClick = useCallback((vinyl: Vinyl) => {
        if (!selectionMode) {
            setSelectedVinylForEdit(vinyl);
        }
    }, [selectionMode]);

    const handlePlay = useCallback(async (userId: number, vinylId: number) => {
        const result = await recordPlay(userId, vinylId);
        if (!result.success) {
            console.error('Error recording play:', result.error);
        }
    }, [recordPlay]);

    const handleBackup = useCallback(async () => {
        const result = await createBackup();
        if (!result.success) {
            showAlert('Backup failed');
        }
    }, [createBackup, showAlert]);

    const handleRestore = useCallback(async () => {
        // Show warning about data reset
        const warningMessage = m('restore_warning') ||
            'WARNING: This will completely replace ALL your current data (including login information, vinyl collection, and user settings) with the data from the backup file. This action cannot be undone.\n\nAre you sure you want to continue?';

        if (!showConfirm(warningMessage)) {
            return;
        }

        const result = await restoreBackup();
        if (result.success) {
            showAlert(m('restore_success') || 'Restore successful');
            window.location.reload();
        } else {
            // example error: {"error":"Invalid backup file - please upload a signed backup file"}
            // show error message from the result
            if (result.error == 'Invalid backup file - please upload a signed backup file') {
                showAlert(m('invalid_backup_file') || 'Invalid backup file - please upload a signed backup file');
            } else {
                showAlert(m('restore_failed') || 'Restore failed');
            }
        }
    }, [restoreBackup, m, showAlert, showConfirm]);

    const handleLogout = useCallback(async () => {
        const success = await logout();
        if (!success) {
            console.error('Logout failed');
        }
    }, [logout]);

    const handleAddVinyl = useCallback(async (newVinyl: Omit<Vinyl, 'id'>) => {
        const result = await addVinyl(newVinyl);
        if (result.success) {
            setAddNewVinyl(false);
            showAlert('Vinyl added successfully.');
            window.location.reload();
        } else {
            showAlert('Failed to add vinyl.');
        }
    }, [addVinyl, showAlert]);

    const handleUpdateVinyl = useCallback(async (updatedVinyl: Vinyl) => {
        const result = await updateVinyl(updatedVinyl);
        if (result.success) {
            setSelectedVinylForEdit(null);
            showAlert('Vinyl updated successfully.');
        } else {
            showAlert('Failed to update vinyl.');
        }
    }, [updateVinyl, showAlert]);

    const handleVinylKeyDown = useCallback((
        event: React.KeyboardEvent,
        vinyl: Vinyl,
    ) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!selectionMode) {
                handleVinylClick(vinyl);
            }
        }
    }, [selectionMode, handleVinylClick]);

    const handlePlayClick = useCallback((
        event: React.MouseEvent,
        vinylId: number,
    ) => {
        event.stopPropagation();
        const userId = getUserId();
        handlePlay(userId, vinylId);
    }, [getUserId, handlePlay]);

    // Show loading state while vinyls are being fetched
    if (isLoading) {
        return <LoadingMessage />;
    }

    const vinylActionItems: MenuItem[] = [
        {
            title: m('select') || 'Select',
            onClick: () => setSelectionMode(true),
        },
        {
            title: m('add_new_vinyl') || 'Add New Vinyl',
            onClick: () => setAddNewVinyl(true),
        },
    ];

    const backupRestoreItems: MenuItem[] = [
        {
            title: m('backup') || 'Backup',
            onClick: handleBackup,
        },
        {
            title: m('restore') || 'Restore',
            onClick: handleRestore,
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f6f1] font-serif text-[#2e2e2e] flex flex-col">
            {/* Main Content Area */}
            <main className="flex-1 p-3 sm:p-6 min-h-0">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 mb-4 rounded border border-red-300 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-2">
                    <WelcomeBan />
                </div>

                {/* Compact header with single-line action bar */}
                <div className="mb-6 pb-4 border-b border-[#c9b370]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase text-center sm:text-left">
                            {m('manage')}
                        </h1>

                        {/* Action buttons */}
                        {!selectionMode ? (
                            <div className="flex flex-row flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
                                {/* Vinyl Actions Dropdown */}
                                <div className="relative" style={{ zIndex: 1000 }}>
                                    <MenuDropdown
                                        title={m('vinyl_actions') || 'Vinyl Actions'}
                                        items={vinylActionItems}
                                    />
                                </div>

                                {/* Backup & Restore Dropdown */}
                                <div className="relative" style={{ zIndex: 999 }}>
                                    <MenuDropdown
                                        title={m('backup_restore') || 'Backup & Restore'}
                                        items={backupRestoreItems}
                                    />
                                </div>

                                {/* User Settings */}
                                <div className="relative" style={{ zIndex: 998 }}>
                                    <UserDropdown username={username} onLogout={handleLogout} />
                                </div>

                                {/* Language Switcher */}
                                <div className="relative" style={{ zIndex: 997 }}>
                                    <LanguageSwitcher />
                                </div>
                            </div>
                        ) : (
                            /* Selection Mode Header */
                            <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
                                {selectedVinyls.length > 0 && (
                                    <button
                                        onClick={handleDeleteSelected}
                                        className="bg-[#aa4a44] text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#993d38] transition-all outline-none focus:ring-2 focus:ring-[#aa4a44] focus:ring-offset-2 flex items-center gap-2"
                                        type="button"
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
                                    className="bg-[#888] text-white px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#777] transition-all outline-none focus:ring-2 focus:ring-[#888] focus:ring-offset-2 flex items-center gap-2"
                                    type="button"
                                >
                                    <span>✖️</span>
                                    <span>{m('cancel')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Improved responsive vinyl grid */}
                <div className="w-full">
                    {vinyls && vinyls.length > 0 ? (
                        <div className="grid gap-6 justify-center
                grid-cols-1 
                sm:grid-cols-2 sm:gap-8
                lg:grid-cols-3 
                xl:grid-cols-4
                2xl:grid-cols-5">
                            {vinyls.map((vinyl: Vinyl) => (
                                <div
                                    key={vinyl.id}
                                    onClick={() => !selectionMode && handleVinylClick(vinyl)}
                                    className="cursor-pointer flex justify-center"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(event) => handleVinylKeyDown(event, vinyl)}
                                >
                                    <VinylItem
                                        vinyl={vinyl}
                                        isSelected={selectedVinyls.includes(vinyl.id)}
                                        onToggleSelect={() => toggleSelectVinyl(vinyl.id)}
                                        selectionMode={selectionMode}
                                        onClickPlay={(event) => handlePlayClick(event, vinyl.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-base sm:text-lg">{c('no_vinyls_found')}</p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {selectedVinylForEdit && (
                    <EditVinylModal
                        vinyl={selectedVinylForEdit}
                        onClose={() => setSelectedVinylForEdit(null)}
                        onSave={handleUpdateVinyl}
                    />
                )}

                {addNewVinyl && (
                    <AddVinylModal
                        onClose={() => setAddNewVinyl(false)}
                        onSave={handleAddVinyl}
                    />
                )}
            </main>

            {/* Footer - Always at bottom */}
            <Footer className="mt-auto flex-shrink-0" />
        </div>
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
        return <LoadingMessage />;
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
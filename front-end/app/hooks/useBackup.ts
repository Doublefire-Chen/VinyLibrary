import { BACKEND_URL } from '@/app/lib/config';

interface BackupResult {
    success: boolean;
    error?: string;
}

export function useBackup() {
    const createBackup = async (): Promise<BackupResult> => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/system/backup`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                throw new Error('Backup failed');
            }

            const blob = await res.blob();
            let filename = 'backup.zip';

            const disposition = res.headers.get('Content-Disposition');
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match?.[1]) {
                    filename = match[1];
                }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Backup error:', error);
            return { success: false, error: errorMessage };
        }
    };

    const restoreBackup = async (): Promise<BackupResult> => {
        return new Promise<BackupResult>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.zip';

            input.addEventListener('change', async (event: Event) => {
                const target = event.target as HTMLInputElement;
                const file = target.files?.[0];

                if (!file) {
                    resolve({ success: false, error: 'No file selected' });
                    return;
                }

                const formData = new FormData();
                formData.append('backup', file);

                try {
                    const res = await fetch(`${BACKEND_URL}/api/system/restore`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    });

                    if (res.ok) {
                        resolve({ success: true });
                    } else {
                        const data = await res.json();
                        resolve({
                            success: false,
                            error: data?.error || 'Unknown error',
                        });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    resolve({ success: false, error: errorMessage });
                }
            });

            input.click();
        });
    };

    return {
        createBackup,
        restoreBackup,
    };
}
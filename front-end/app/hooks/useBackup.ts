import { BACKEND_URL } from '@/app/lib/config';

export function useBackup() {
    const createBackup = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/backup`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!res.ok) {
                throw new Error('Backup failed');
            }

            const blob = await res.blob();
            let filename = "backup.zip";

            const disposition = res.headers.get('Content-Disposition');
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
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
        } catch (err: any) {
            console.error('Backup error:', err);
            return { success: false, error: err.message };
        }
    };

    const restoreBackup = async () => {
        return new Promise<{ success: boolean; error?: string }>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.zip';

            input.onchange = async (e: any) => {
                const file = e.target.files[0];
                if (!file) {
                    resolve({ success: false, error: 'No file selected' });
                    return;
                }

                const formData = new FormData();
                formData.append('backup', file);

                try {
                    const res = await fetch(`${BACKEND_URL}/api/restore`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include',
                    });

                    if (res.ok) {
                        resolve({ success: true });
                    } else {
                        const data = await res.json();
                        resolve({ success: false, error: data?.error || 'Unknown error' });
                    }
                } catch (err: any) {
                    resolve({ success: false, error: err.message });
                }
            };

            input.click();
        });
    };

    return {
        createBackup,
        restoreBackup
    };
}
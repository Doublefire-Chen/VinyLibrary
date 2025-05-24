// Refactored Homepage (page.tsx)
'use client';

import VinylCard from '@/app/ui/VinylCard';
import Link from 'next/link';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import LoadingMessage from '@/app/ui/LoadingMessage';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';
import UserDropdown from '@/app/ui/UserDropdown';
import { useAuth } from '@/app/hooks/useAuth';
import { useVinyls } from '@/app/hooks/useVinyls';

export default function Page() {
  const { isLoggedIn, username, logout } = useAuth();
  const { vinyls, isLoading } = useVinyls();
  const { t: c } = useTranslation('common');

  const handleLogout = async () => {
    const success = await logout();
    if (!success) {
      // Handle logout error if needed
      console.error('Logout failed');
    }
  };

  if (isLoading) {
    return <LoadingMessage />;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white py-6 px-6 shadow-md border-b-4 border-[#c9b370] relative">
        <WelcomeBan />

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <ButtonLink href="/" variant="current">
                {c('homepage')}
              </ButtonLink>
              <ButtonLink href="/manage" variant="notcurrent">
                {c('manage')}
              </ButtonLink>
              <UserDropdown username={username} onLogout={handleLogout} />
              <LanguageSwitcher />
            </>
          ) : (
            <>
              <ButtonLink href="/" variant="current">
                {c('homepage')}
              </ButtonLink>
              <ButtonLink href="/login" variant="notcurrent">
                {c('login')}
              </ButtonLink>
              <ButtonLink href="/register" variant="notcurrent">
                {c('register')}
              </ButtonLink>
              <LanguageSwitcher />
            </>
          )}
        </div>
      </header>

      {/* Vinyl Grid */}
      <main className="px-6 py-10 bg-[#f8f6f1]">
        <div className="flex flex-wrap justify-center gap-6">
          {vinyls?.length > 0 ? (
            vinyls.map((vinyl) => (
              <Link href={`/${vinyl.id}`} key={vinyl.id}>
                <VinylCard vinyl={vinyl} />
              </Link>
            ))
          ) : (
            <div className="text-center w-full py-10">
              <p className="text-lg text-gray-600">{c('no_vinyls_found')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
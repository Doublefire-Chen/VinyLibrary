// Mobile-Responsive Homepage (page.tsx)
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
import { useState } from 'react';
import GithubIcon from '@/app/ui/GithubIcon';

export default function Page() {
  const { isLoggedIn, username, logout } = useAuth();
  const { vinyls, isLoading } = useVinyls();
  const { t: c } = useTranslation('common');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const success = await logout();
    if (!success) {
      // Handle logout error if needed
      console.error('Logout failed');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return <LoadingMessage />;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] text-[#2e2e2e] font-serif">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white shadow-md border-b-4 border-[#c9b370] relative">
        {/* Desktop Header */}
        <div className="hidden md:block py-6 px-6">
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
                <UserDropdown username={username} onLogout={handleLogout} variant='notcurrent' />
                <LanguageSwitcher />
                <GithubIcon />
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
                <GithubIcon />
              </>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <WelcomeBan />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col justify-center items-center w-8 h-8 bg-transparent border-none cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}></span>
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 my-1 ${isMobileMenuOpen ? 'opacity-0' : ''
                }`}></span>
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}></span>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className={`transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className="bg-[#2a2a2a] border-t border-[#c9b370]">
              {isLoggedIn ? (
                <nav className="flex flex-col">
                  <Link
                    href="/"
                    className="px-6 py-4 text-white bg-[#4a90e2] border-b border-[#c9b370]/20 font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c('homepage')}
                  </Link>
                  <Link
                    href="/manage"
                    className="px-6 py-4 text-white hover:bg-[#3a3a3a] border-b border-[#c9b370]/20 font-medium text-center transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c('manage')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-6 py-4 text-white hover:bg-[#3a3a3a] border-b border-[#c9b370]/20 font-medium text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-sm">👤</span>
                    {username} • {c('logout') || 'Logout'}
                  </button>
                  <div className="px-6 py-4 flex justify-center">
                    <LanguageSwitcher />
                  </div>
                  <div className="px-6 py-4 flex justify-center border-t border-[#c9b370]/20">
                    <GithubIcon />
                  </div>
                </nav>
              ) : (
                <nav className="flex flex-col">
                  <Link
                    href="/"
                    className="px-6 py-4 text-white bg-[#4a90e2] border-b border-[#c9b370]/20 font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c('homepage')}
                  </Link>
                  <Link
                    href="/login"
                    className="px-6 py-4 text-white hover:bg-[#3a3a3a] border-b border-[#c9b370]/20 font-medium text-center transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c('login')}
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-4 text-white hover:bg-[#3a3a3a] border-b border-[#c9b370]/20 font-medium text-center transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {c('register')}
                  </Link>
                  <div className="px-6 py-4 flex justify-center">
                    <LanguageSwitcher />
                  </div>
                  <div className="px-6 py-4 flex justify-center border-t border-[#c9b370]/20">
                    <GithubIcon />
                  </div>
                </nav>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Vinyl Grid */}
      <main className="px-3 sm:px-6 py-6 sm:py-10 bg-[#f8f6f1]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
          {vinyls?.length > 0 ? (
            vinyls.map((vinyl) => (
              <Link href={`/vinyl?id=${vinyl.id}`} key={vinyl.id} className="w-full max-w-xs">
                <VinylCard vinyl={vinyl} />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center w-full py-10">
              <p className="text-base sm:text-lg text-gray-600 px-4">{c('no_vinyls_found')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
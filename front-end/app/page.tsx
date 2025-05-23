'use client';

import { useEffect, useState } from 'react';
import VinylCard from '@/app/ui/VinylCard';
import type { Vinyl } from '@/app/lib/definitions';
import { BACKEND_URL } from '@/app/lib/config';
import Link from 'next/link';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { UserIcon } from 'lucide-react';
import LoadingMessage from '@/app/ui/LoadingMessage';
import WelcomeBan from '@/app/ui/WelcomeBan';
import ButtonLink from '@/app/ui/ButtonLink';

export default function Page() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const { t: c } = useTranslation('common');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/vinyls`);
        const data = await response.json();
        setVinyls(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const loginStatus = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(loginStatus === 'true');

    if (loginStatus) {
      const storedUsername = localStorage.getItem('username') || 'User';
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout failed');
        return;
      }

      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('username');
      localStorage.removeItem('user_id');
      setIsLoggedIn(false);
      setUsername('');
    } catch (error) {
      console.error('Logout error:', error);
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

              <div className="relative group">
                <button className="flex items-center gap-1 bg-[#c9b370] text-black px-4 py-2 rounded-full text-sm tracking-wide font-medium shadow hover:bg-[#b89f56] transition">
                  <UserIcon className="w-4 h-4" />
                  {username}
                </button>
                <div
                  className="absolute right-0 top-full mt-1 
                bg-white text-black rounded-md shadow-xl text-sm w-full whitespace-normal
                invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 overflow-hidden border border-[#c9b370]"
                  style={{
                    boxShadow: "0 6px 24px 0 rgba(201,179,112,0.08), 0 1.5px 3px 0 rgba(0,0,0,0.06)",
                    minWidth: "100%"
                  }}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-[#f5f0e6] text-center w-full"
                  >
                    {c('profile')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 hover:bg-[#f5f0e6] text-center"
                  >
                    {c('logout')}
                  </button>
                </div>
              </div>

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
      </main >
    </div >
  );
}

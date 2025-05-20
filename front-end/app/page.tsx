'use client'; // 强制客户端渲染

import { useEffect, useState } from 'react';
import VinylCard from '@/app/ui/VinylCard';
import type { Vinyl } from '@/app/lib/definitions'; // 抽离类型定义
import { BACKEND_URL } from '@/app/lib/config'; // 引入后端地址
import Link from 'next/link';
import LanguageSwitcher from '@/app/ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Page() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showMenu, setShowMenu] = useState(false);
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

    // Read login status from localStorage
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
        credentials: 'include', // include cookies
      });

      if (!response.ok) {
        console.error('Logout failed');
        return;
      }

      // Clear local state and storage
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.removeItem('username');
      localStorage.removeItem('user_id');
      setIsLoggedIn(false);
      setUsername('');
      setShowMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>; // 显示加载状态
  }

  return (
    <div className="space-y-4">
      <div className="bg-black text-white text-center py-2 relative">
        <div className="flex flex-col items-center gap-0">
          <h1 className="text-2xl font-semibold leading-light">
            {c('welcome')}
          </h1>
          <p className="text-sm font-normal leading-none">
            {c('welcome_message')}
          </p>
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
          {isLoggedIn ? (
            <>
              <Link
                href="/manage"
                className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 text-sm"
              >
                {c('manage')}
              </Link>
              <div className="relative w-max group">
                <div className="flex flex-col">
                  <div className="flex items-center bg-white text-black px-3 py-1 rounded hover:bg-gray-200 text-sm cursor-pointer w-full">
                    <span className="mr-2">👤</span> {username}
                  </div>
                  <div className="absolute right-0 top-full mt-1 bg-white text-black rounded-md shadow-lg text-sm z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 w-full overflow-hidden">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      {c('profile')}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {c('logout')}
                    </button>
                  </div>
                </div>
              </div>
              <LanguageSwitcher />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-white text-black px-3 py-1 rounded hover:bg-gray-200 text-sm"
              >
                {c('login')}
              </Link>
              <LanguageSwitcher />
            </>
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {vinyls.map((vinyl) => (
          <Link href={`/${vinyl.id}`} key={vinyl.id}>
            <VinylCard vinyl={vinyl} />
          </Link>
        ))}
      </div>
    </div>
  );
}
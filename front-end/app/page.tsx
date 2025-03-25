'use client'; // 强制客户端渲染

import { useEffect, useState } from 'react';
import VinylCard from '@/app/ui/VinylCard';
import type { Vinyl } from '@/app/lib/definitions'; // 抽离类型定义
import { BACKEND_URL } from '@/app/lib/config'; // 引入后端地址
import Link from 'next/link';

export default function Page() {
  const [vinyls, setVinyls] = useState<Vinyl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>; // 显示加载状态
  }

  return (
    <div className="space-y-4">
      <div className="bg-black text-white text-center py-2 relative">
        <div className="flex flex-col items-center gap-0">
          <h1 className="text-2xl font-semibold leading-light">
            Welcome to Vinyl Collection
          </h1>
          <p className="text-sm font-normal leading-none">
            Explore a collection of timeless vinyl records.
          </p>
        </div>
        <Link
          href="/login"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black px-3 py-1 rounded hover:bg-gray-200 text-sm"
        >
          Login
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {vinyls.map((vinyl) => (
          <VinylCard key={vinyl.id} vinyl={vinyl} />
        ))}
      </div>
    </div>
  );
}
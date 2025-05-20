'use client';

import { useState } from 'react';
import i18n from '@/i18n'; // adjust path if needed
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  // Add more if needed
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const { i18n: i18next } = useTranslation();

  const currentLang = languages.find((lang) => lang.code === i18next.language) || languages[0];

  return (
    <div className="relative w-max group">
      <div className="flex flex-col">
        <div className="flex items-center bg-white text-black px-3 py-1 rounded hover:bg-gray-200 text-sm cursor-pointer w-full"
          onClick={() => setOpen(!open)}
        >
          <span className="mr-2">{currentLang.flag}</span> {currentLang.label}
        </div>

        <div className={`absolute right-0 top-full mt-1 bg-white text-black rounded-md shadow-lg text-sm z-20 transition-all duration-200 overflow-hidden min-w-[100px]
  ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18next.changeLanguage(lang.code);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
            >
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

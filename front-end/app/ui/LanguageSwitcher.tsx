'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Language options
const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { i18n: i18next } = useTranslation();
  const currentLang = languages.find((lang) => lang.code === i18next.language) || languages[0];
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard and blur for accessibility
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div
      className={`relative z-30 ${className}`}
      tabIndex={0}
      onBlur={handleBlur}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Main Button */}
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center justify-between bg-[#c9b370] text-black px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#b89f56] transition focus:outline-none focus:ring-2 focus:ring-[#c9b370]"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ height: '36px', minWidth: '120px' }}
      >
        <span className="mr-2 text-base">{currentLang.flag}</span>
        <span>{currentLang.label}</span>
        <svg className="ml-1 w-4 h-4 text-[#b89f56] align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-1 bg-white font-serif rounded-xl border border-[#c9b370] shadow-2xl py-1 z-40
      transition-all duration-150 ${open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
        style={{
          boxShadow: '0 4px 20px 0 rgba(201,179,112,0.13)',
          minWidth: buttonRef.current ? buttonRef.current.offsetWidth + 'px' : '120px'
        }}
        role="listbox"
      >
        {languages.map((lang) => {
          const isActive = i18next.language === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => {
                i18next.changeLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide 
          ${isActive
                  ? 'bg-[#f7ecd4] text-[#ba910c] font-bold'
                  : 'hover:bg-[#f5f0e6] text-[#222]'
                }
          transition rounded-lg`}
              role="option"
              aria-selected={isActive}
              tabIndex={0}
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
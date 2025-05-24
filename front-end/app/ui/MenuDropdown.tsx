'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';

interface MenuDropdownItem {
  label: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

interface MenuDropdownProps {
  title?: string;
  items: MenuDropdownItem[];
  className?: string;
}

export default function MenuDropdown({ title, items, className = '' }: MenuDropdownProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
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
      <button
        ref={buttonRef}
        type="button"
        className="flex items-center justify-between bg-[#c9b370] text-black px-4 py-2 rounded-full text-sm font-medium tracking-wide shadow hover:bg-[#b89f56] transition focus:outline-none focus:ring-2 focus:ring-[#c9b370]"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ height: '36px', minWidth: '120px' }}
      >
        <span>{title}</span>
        <svg className="ml-1 w-4 h-4 text-[#b89f56] align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {
        open && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-full z-40">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#f5f0e6] ${item.className ?? ''}`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        )
      }
    </div>
  );
}
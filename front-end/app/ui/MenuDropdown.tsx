'use client';

import React from 'react';
import { useState, useRef } from 'react';

interface MenuDropdownItem {
  title?: string;
  onClick: () => void;
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
      {/* Main Button */}
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
        {
          open && (
            <div>
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={`block rounded-xl w-full text-left px-4 py-2 text-sm hover:bg-[#f5f0e6] ${item.className ?? ''}`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
'use client';

import { ArrowRight2 } from 'iconsax-reactjs';
import type React from 'react';
import { useState } from 'react';

export const PremiumCTA = ({
  children,
  onClick,
  className = '',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative px-6 py-3 rounded-full overflow-hidden
        bg-gradient-to-b from-[#2997FF] to-[#0071E3]
        shadow-[0_4px_16px_rgba(0,113,227,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
        hover:shadow-[0_6px_20px_rgba(0,113,227,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
        active:shadow-[0_2px_8px_rgba(0,113,227,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
        active:scale-[0.98]
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center gap-2 justify-center">
        <span className="text-sm font-medium text-white">{children}</span>
        <ArrowRight2
          size={16}
          variant="Linear"
          className={`text-foreground/80 transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''}`}
        />
      </div>
    </button>
  );
};

export const PremiumSecondary = ({
  children,
  onClick,
  className = '',
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative px-6 py-3 rounded-full
        bg-gradient-to-b from-[#F5F5F7] to-[#E8E8ED] dark:from-[#2C2C2E] dark:to-[#1C1C1E]
        border border-[#D1D1D6]/50 dark:border-[#38383A]/50
        shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]
        active:scale-[0.98]
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="text-sm font-medium text-[#1D1D1F] dark:text-[#EBEBF5] group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors duration-300">
        {children}
      </span>
    </button>
  );
};

export const PremiumInput = ({
  placeholder = '',
  value,
  onChange,
  className = '',
  type = 'text',
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`
        p-[1px] rounded-xl
        ${
          isFocused
            ? 'bg-gradient-to-b from-[#2997FF] to-[#0071E3]'
            : 'bg-gradient-to-b from-[#E5E5EA] to-[#D1D1D6] dark:from-[#38383A] dark:to-[#2C2C2E]'
        }
        transition-all duration-300
        ${className}
      `}
    >
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="
          w-full px-4 py-3 rounded-[11px]
          bg-[#FFFFFF] dark:bg-[#1C1C1E]
          text-sm text-[#1D1D1F] dark:text-[#EBEBF5]
          placeholder:text-[#AEAEB2] dark:placeholder:text-[#636366]
          outline-none
          transition-all duration-300
        "
      />
    </div>
  );
};

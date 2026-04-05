import type React from 'react';

export const SvgGradients = () => (
  <svg width="0" height="0" className="absolute pointer-events-none">
    <defs>
      <linearGradient id="icon-light" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop stopColor="#1D1D1F" offset="0%" />
        <stop stopColor="#6E6E73" offset="100%" />
      </linearGradient>
      <linearGradient id="icon-dark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop stopColor="#FFFFFF" offset="0%" />
        <stop stopColor="#86868B" offset="100%" />
      </linearGradient>
      <linearGradient id="icon-white" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop stopColor="#FFFFFF" offset="0%" />
        <stop stopColor="#EBEBF5" offset="100%" />
      </linearGradient>
    </defs>
  </svg>
);

export const PremiumLabel = ({
  type = 'body',
  children,
  className = '',
}: {
  type?: 'h1' | 'h2' | 'body' | 'caption' | 'cta' | 'h3';
  children: React.ReactNode;
  className?: string;
}) => {
  const styles = {
    h1: 'text-3xl md:text-4xl font-semibold tracking-tighter from-[#000000] to-[#434347] dark:from-[#FFFFFF] dark:to-[#A1A1A6]',
    h2: 'text-xl md:text-2xl font-semibold tracking-tight from-[#1D1D1F] to-[#6E6E73] dark:from-[#EBEBF5] dark:to-[#8E8E93]',
    h3: 'text-lg font-semibold tracking-tight from-[#1D1D1F] to-[#6E6E73] dark:from-[#EBEBF5] dark:to-[#8E8E93]',
    body: 'text-sm font-medium from-[#6E6E73] to-[#8E8E93] dark:from-[#98989D] dark:to-[#636366]',
    caption:
      'text-xs font-bold uppercase tracking-widest from-[#AEAEB2] to-[#C7C7CC] dark:from-[#636366] dark:to-[#48484A]',
    cta: 'text-sm font-medium from-[#FFFFFF] to-[#F5F5F7] dark:from-[#FFFFFF] dark:to-[#EBEBF5]',
  };

  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-b ${styles[type]} antialiased block ${className}`}
    >
      {children}
    </span>
  );
};

export const PremiumCard = ({
  children,
  className = '',
  innerClassName = '',
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) => {
  return (
    <div
      className={`p-[1px] rounded-[24px] bg-gradient-to-b from-[#E5E5EA] to-[#D1D1D6] dark:from-[#333336] dark:to-[#1C1C1E] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] transition-all duration-300 ${className}`}
    >
      <div
        className={`rounded-[23px] bg-gradient-to-br from-[#FFFFFF] to-[#F8F8FA] dark:from-[#1A1A1C] dark:to-[#0F0F11] relative h-full p-6 md:p-8 ${innerClassName}`}
      >
        <div className="absolute inset-0 rounded-[23px] bg-gradient-to-b from-[#FFFFFF]/60 to-[#FFFFFF]/0 dark:from-[#FFFFFF]/5 dark:to-[#000000]/0 pointer-events-none" />
        <div className="relative z-10 h-full">{children}</div>
      </div>
    </div>
  );
};

export const PremiumIcon = ({
  icon: Icon,
  size = 20,
  className = '',
}: {
  icon: React.ComponentType<{ size?: number; variant?: string; color?: string }>;
  size?: number;
  className?: string;
}) => {
  return (
    <div
      className={`p-[1px] rounded-2xl bg-gradient-to-b from-[#E5E5EA] to-[#FFFFFF] dark:from-[#38383A] dark:to-[#1C1C1E] inline-block shrink-0 ${className}`}
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-[15px] bg-gradient-to-br from-[#FFFFFF] to-[#F5F5F7] dark:from-[#242426] dark:to-[#1A1A1C] shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center">
        <div className="block dark:hidden text-[#1D1D1F]">
          <Icon size={size} variant="Bulk" color="currentColor" />
        </div>
        <div className="hidden dark:block text-foreground/80">
          <Icon size={size} variant="Bulk" color="currentColor" />
        </div>
      </div>
    </div>
  );
};

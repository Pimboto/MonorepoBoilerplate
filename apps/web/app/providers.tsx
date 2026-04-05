'use client';

import { Toast } from '@heroui/react';
import type { ThemeProviderProps } from 'next-themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type * as React from 'react';
import { AuthProvider } from '@/context/auth-context';

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <NextThemesProvider {...themeProps}>
      <AuthProvider>
        <Toast.Provider placement="bottom end" />
        {children}
      </AuthProvider>
    </NextThemesProvider>
  );
}

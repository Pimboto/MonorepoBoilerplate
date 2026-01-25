'use client';

import { Switch } from '@heroui/react';
import { useIsSSR } from '@react-aria/ssr';
import clsx from 'clsx';
import { useTheme } from 'next-themes';
import type { FC } from 'react';

import { MoonFilledIcon, SunFilledIcon } from '@/components/icons';

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const isSSR = useIsSSR();

  const onChange = (isSelected: boolean) => {
    setTheme(isSelected ? 'light' : 'dark');
  };

  return (
    <Switch
      isSelected={theme === 'light' || isSSR}
      onChange={onChange}
      aria-label={`Switch to ${theme === 'light' || isSSR ? 'dark' : 'light'} mode`}
      className={clsx('px-px transition-opacity hover:opacity-80 cursor-pointer', className)}
    >
      {({ isSelected }) => (
        <Switch.Control className="w-auto h-auto bg-transparent rounded-lg flex items-center justify-center !text-default-500 pt-px px-0 mx-0">
          <Switch.Thumb className="hidden" />
          <Switch.Icon>
            {!isSelected || isSSR ? <SunFilledIcon size={22} /> : <MoonFilledIcon size={22} />}
          </Switch.Icon>
        </Switch.Control>
      )}
    </Switch>
  );
};

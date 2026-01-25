'use client';

import NextLink from 'next/link';
import { ThemeSwitch } from '@/components/theme-switch';
import { siteConfig } from '@/config/site';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand + Nav Links */}
          <div className="flex items-center gap-8">
            <NextLink className="flex items-center gap-2" href="/">
              <p className="font-bold text-inherit">ACME</p>
            </NextLink>

            <ul className="hidden lg:flex gap-6 items-center">
              {siteConfig.navItems.map(item => (
                <li key={item.href}>
                  <NextLink
                    className="link text-sm text-foreground hover:text-primary transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
};

'use client';

import NextLink from 'next/link';
import { ThemeSwitch } from '@/components/theme-switch';
import { CustomButton } from '@/components/ui/CustomButton';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/context/auth-context';

export const Navbar = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Brand + Nav Links */}
          <div className="flex items-center gap-8">
            <NextLink className="flex items-center gap-2" href="/">
              <p className="font-bold text-inherit">{siteConfig.name}</p>
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
            {!isLoading &&
              (isAuthenticated ? (
                <NextLink href="/app">
                  <CustomButton>Go to App</CustomButton>
                </NextLink>
              ) : (
                <>
                  <NextLink href="/login">
                    <CustomButton variant="ghost">Login</CustomButton>
                  </NextLink>
                  <NextLink href="/signup">
                    <CustomButton>Sign Up</CustomButton>
                  </NextLink>
                </>
              ))}
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </nav>
  );
};

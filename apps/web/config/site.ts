export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'CocoStudio',
  description: 'Run AI workflows serverlessly. Manage your generated collections.',
  navItems: [
    {
      label: 'Home',
      href: '/',
    },
  ],
  links: {},
  sidebarItems: [
    {
      label: 'Dashboard',
      href: '/app',
      icon: 'Home',
    },
    {
      label: 'Collections',
      href: '/app/collections',
      icon: 'Gallery',
    },
    {
      label: 'Settings',
      href: '/app/settings',
      icon: 'Setting',
    },
  ],
  navActions: [
    {
      label: 'Go to App',
      href: '/app',
      cta: true,
    },
  ],
};

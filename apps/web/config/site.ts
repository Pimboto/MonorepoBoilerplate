export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: 'StarStudio',
  description: 'Make beautiful websites regardless of your design experience.',
  navItems: [
    {
      label: 'Home',
      href: '/',
    },
    {
      label: 'Buttons',
      href: '/buttons',
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
      label: 'Product',
      href: '/app/product',
      icon: 'Box', // Generic icon, mapped later
      items: [
        {
          label: 'Overview',
          href: '/app/product/overview',
        },
        {
          label: 'Drafts',
          href: '/app/product/drafts',
          badge: '3', // As per image
        },
        {
          label: 'Released',
          href: '/app/product/released',
        },
        {
          label: 'Comments',
          href: '/app/product/comments',
        },
        {
          label: 'Scheduled',
          href: '/app/product/scheduled',
          badge: '8',
        },
      ],
    },
    {
      label: 'Customers',
      href: '/app/customers',
      icon: 'User',
    },
    {
      label: 'Collections',
      href: '/app/collections',
      icon: 'Gallery',
    },
    {
      label: 'Shop',
      href: '/app/shop',
      icon: 'Bag',
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

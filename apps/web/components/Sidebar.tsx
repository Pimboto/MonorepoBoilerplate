'use client';

import { Avatar, Tooltip } from '@heroui/react';
import { ArrowDown2, ArrowLeft2, Gallery, Hierarchy, Home2, Setting2 } from 'iconsax-reactjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { CustomButton } from '@/components/ui/CustomButton';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/context/auth-context';

interface SidebarSubItem {
  label: string;
  href: string;
  badge?: string;
}

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  items?: SidebarSubItem[];
}

interface NavItemProps {
  item: SidebarItem;
  icon: React.ComponentType<Record<string, unknown>>;
  isActive: boolean;
  isCollapsed: boolean;
}

const iconMap: Record<string, React.ComponentType<Record<string, unknown>>> = {
  Home: Home2,
  Hierarchy: Hierarchy,
  Gallery: Gallery,
  Setting: Setting2,
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const checkActive = (item: SidebarItem | SidebarSubItem): boolean => {
    return (
      pathname === item.href ||
      ('items' in item && (item.items?.some((child: SidebarSubItem) => checkActive(child)) ?? false))
    );
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-content1/50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        borderRight: '1px solid transparent',
        borderImage: 'linear-gradient(to bottom, transparent, var(--color-border), transparent) 1',
      }}
    >
      {/* Logo Section */}
      <div className="flex flex-col relative">
        <Link
          href="/"
          className="flex items-center gap-3 h-20 pt-5 px-6 relative cursor-pointer group"
        >
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-9 w-9 rounded-xl transition-transform group-hover:scale-105"
          />

          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-foreground leading-none">
                CocoStudio
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase mt-1">
                Workspace
              </span>
            </div>
          )}
        </Link>

        {/* 1rs Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-90 mb-4" />

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-background border border-border rounded-full p-1.5 hover:bg-content1 transition-all z-20 shadow-sm"
        >
          <ArrowLeft2
            size={14}
            variant="Linear"
            className={`text-foreground transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-full h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-30" />

      <nav className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto scrollbar-hide">
        {siteConfig.sidebarItems.map(item => (
          <NavItem
            key={item.href || item.label}
            item={item}
            icon={iconMap[item.icon as string] || Home2}
            isActive={checkActive(item)}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-90" />

      {/* Footer */}
      <div className="p-5 mt-auto">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          {isCollapsed ? (
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Link href="/app/settings" className="cursor-pointer">
                  <Avatar size="md">
                    {user?.image ? <Avatar.Image alt={user.name} src={user.image} /> : null}
                    <Avatar.Fallback>{getInitials(user?.name)}</Avatar.Fallback>
                  </Avatar>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content placement="right" showArrow>
                <Tooltip.Arrow />
                <div className="px-1 py-1">
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
              </Tooltip.Content>
            </Tooltip>
          ) : (
            <Link
              href="/app/settings"
              className="flex items-center gap-3 w-full hover:bg-content2/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
            >
              <Avatar size="md">
                {user?.image ? <Avatar.Image alt={user.name} src={user.image} /> : null}
                <Avatar.Fallback>{getInitials(user?.name)}</Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-sm font-medium truncate">{user?.name}</span>
                <span className="text-xs text-default-500 truncate">{user?.email}</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ item, icon: Icon, isActive, isCollapsed }: NavItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  React.useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  const hasChildren = item.items && item.items.length > 0;

  if (hasChildren && isCollapsed) {
    return (
      <Tooltip delay={0}>
        <Tooltip.Trigger>
          <div className="w-full flex justify-center">
            <CustomButton
              variant={isActive ? 'primary' : 'ghost'}
              isIconOnly
              size="md"
              className={`${isActive ? 'shadow-md shadow-primary/20' : 'text-foreground/70'}`}
            >
              <Icon size={22} variant={isActive ? 'Bold' : 'Outline'} />
            </CustomButton>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content placement="right" showArrow className="p-2 min-w-[140px]">
          <Tooltip.Arrow />
          <div className="flex flex-col gap-1">
            <p className="px-2 py-1 text-xs font-bold text-primary uppercase tracking-wider">
              {item.label}
            </p>
            {item.items?.map((subItem: SidebarSubItem) => (
              <Link key={subItem.href} href={subItem.href}>
                <div className="px-2 py-1.5 hover:bg-content2 rounded-md text-sm transition-colors cursor-pointer">
                  {subItem.label}
                </div>
              </Link>
            ))}
          </div>
        </Tooltip.Content>
      </Tooltip>
    );
  }

  if (hasChildren) {
    return (
      <div className="flex flex-col gap-1">
        <CustomButton
          variant={isActive ? 'primary' : 'ghost'}
          size="md"
          className={`w-full justify-between  ${isActive ? 'shadow-md shadow-primary/20' : 'text-foreground/70'}`}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Icon size={22} variant={isActive ? 'Bold' : 'Outline'} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <ArrowDown2
            size={16}
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </CustomButton>

        {isExpanded && (
          <div className="flex flex-col gap-1 pl-4 ml-3 border-l border-divider/50 animate-appearance-in">
            {item.items?.map((subItem: SidebarSubItem) => (
              <Link key={subItem.href} href={subItem.href} className="w-full">
                <CustomButton
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between h-9 text-foreground/70 data-[hover=true]:text-primary"
                >
                  <span className="text-sm">{subItem.label}</span>
                  {subItem.badge && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-medium">
                      {subItem.badge}
                    </span>
                  )}
                </CustomButton>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const content = (
    <CustomButton
      variant={isActive ? 'primary' : 'ghost'}
      size="md"
      isIconOnly={isCollapsed}
      className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} ${isActive ? 'shadow-md shadow-primary/20' : 'text-foreground/70'}`}
    >
      <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
        <Icon size={22} variant={isActive ? 'Bold' : 'Outline'} />
        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
      </div>
    </CustomButton>
  );

  return (
    <Link href={item.href} className="w-full block">
      {isCollapsed ? (
        <Tooltip delay={0}>
          <Tooltip.Trigger>{content}</Tooltip.Trigger>
          <Tooltip.Content placement="right" showArrow>
            <Tooltip.Arrow />
            {item.label}
          </Tooltip.Content>
        </Tooltip>
      ) : (
        content
      )}
    </Link>
  );
};

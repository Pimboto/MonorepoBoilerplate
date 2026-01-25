'use client';

import { Button, Link } from '@heroui/react';
import type { ComponentProps, ReactNode } from 'react';

type ButtonProps = ComponentProps<typeof Button>;
type LinkProps = ComponentProps<typeof Link>;

type CustomButtonAsButton = ButtonProps & { href?: never };
type CustomButtonAsLink = Omit<LinkProps, 'className' | 'children'> & {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: ButtonProps['size'];
  children: ReactNode;
};

type CustomButtonProps = CustomButtonAsButton | CustomButtonAsLink;

/**
 * CustomButton - Botón estilo iOS con "Luz arriba, sombra abajo y stroke delgado".
 * Funciona como Button o Link dependiendo si tiene prop `href`.
 */
export const CustomButton = (props: CustomButtonProps) => {
  const { className = '', variant } = props;

  const baseClasses = `
    relative
    overflow-visible
    font-medium
    rounded-full
    inline-flex items-center justify-center gap-2
    px-4 py-2

    /* Stroke delgado (Border) */
    border-[1.5px] border-black/10 dark:border-white/10

    /* Sombra externa sutil (Drop Shadow) */
    shadow-[0_2px_4px_rgba(0,0,0,0.04)]

    /* Luz arriba y Sombra abajo usando pseudo-elemento para no interferir con el contenido */
    after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none
    after:shadow-[inset_0_1.5px_0.5px_rgba(255,255,255,0.2),inset_0_-1.5px_1.5px_rgba(0,0,0,0.05)]

    /* Transición suave */
    transition-transform active:scale-[0.97]

    /* Variants */
    ${variant === 'primary' ? 'bg-primary text-primary-foreground' : ''}
    ${variant === 'outline' ? 'border-2 border-border bg-transparent' : ''}
    ${variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : ''}

    ${className}
  `;

  if ('href' in props && props.href) {
    const { href, variant: _v, size: _s, children, ...linkProps } = props;
    return (
      <Link href={href} className={baseClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const {
    href: _h,
    variant: _v,
    size: _s,
    children,
    ...buttonProps
  } = props as CustomButtonAsButton;
  return (
    <Button className={baseClasses} {...buttonProps}>
      {children}
    </Button>
  );
};

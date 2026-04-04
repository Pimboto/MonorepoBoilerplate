'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';
import type { ComponentProps } from 'react';

/**
 * CustomButton - Botón estilo iOS con "Luz arriba, sombra abajo y stroke delgado".
 *
 * Cumple con los requisitos:
 * - Luz arriba (inset shadow blanco)
 * - Sombra abajo (inset shadow oscuro)
 * - Stroke delgado (border)
 * - Colores de HeroUI
 * - Diseño exactamente igual a la imagen de referencia
 * - Soporta href mediante Next.js Link
 */

type ButtonProps = ComponentProps<typeof Button>;

interface CustomButtonProps extends ButtonProps {
  href?: string;
}

export const CustomButton = ({ className = '', children, href, ...props }: CustomButtonProps) => {
  const buttonClasses = `
    relative
    overflow-visible
    font-medium
    rounded-full

    /* Stroke delgado (Border) - Only if not ghost */
    ${props.variant !== 'ghost' ? 'border-[1.5px] border-black/10 dark:border-white/10' : 'border-none'}

    /* Sombra externa sutil (Drop Shadow) - Only if not ghost */
    ${props.variant !== 'ghost' ? 'shadow-[0_2px_4px_rgba(0,0,0,0.04)]' : 'shadow-none'}

    /* Luz arriba y Sombra abajo usando pseudo-elemento - Only if not ghost */
    ${
      props.variant !== 'ghost'
        ? 'after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none after:shadow-[inset_0_1.5px_0.5px_rgba(255,255,255,0.2),inset_0_-1.5px_1.5px_rgba(0,0,0,0.05)]'
        : 'after:hidden'
    }

    /* Transición suave */
    transition-transform active:scale-[0.97]

    /* Ensure outline variant has no background */
    ${props.variant === 'outline' ? '!bg-transparent !border-border' : ''}

    ${className}
  `;

  // If href is provided, wrap Button in Link
  if (href) {
    return (
      <Link href={href}>
        <Button className={buttonClasses} {...props}>
          {children}
        </Button>
      </Link>
    );
  }

  return (
    <Button className={buttonClasses} {...props}>
      {children}
    </Button>
  );
};

'use client';

import { Button } from '@heroui/react';
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
 * - Soporta href automáticamente (HeroUI convierte el Button en Link)
 */
export const CustomButton = ({
  className = '',
  children,
  ...props
}: ComponentProps<typeof Button>) => {
  return (
    <Button
      className={`
        relative
        overflow-visible
        font-medium
        rounded-full

        /* Stroke delgado (Border) */
        border-[1.5px] border-black/10 dark:border-white/10

        /* Sombra externa sutil (Drop Shadow) */
        shadow-[0_2px_4px_rgba(0,0,0,0.04)]

        /* Luz arriba y Sombra abajo usando pseudo-elemento para no interferir con el contenido */
        after:absolute after:inset-0 after:rounded-[inherit] after:pointer-events-none
        after:shadow-[inset_0_1.5px_0.5px_rgba(255,255,255,0.2),inset_0_-1.5px_1.5px_rgba(0,0,0,0.05)]

        /* Transición suave */
        transition-transform active:scale-[0.97]

        ${className}
      `}
      {...props}
    >
      {children}
    </Button>
  );
};

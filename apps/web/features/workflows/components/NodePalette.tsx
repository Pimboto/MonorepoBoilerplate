'use client';

import { motion } from 'framer-motion';
import { Brush2, MagicStar, VideoPlay } from 'iconsax-reactjs';
import type { DragEvent } from 'react';

interface PaletteItem {
  type: string;
  label: string;
  description: string;
  icon: typeof MagicStar;
  badge: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'skyPlayground',
    label: 'Image Transform',
    description:
      'Transform images with AI-powered generation using prompts, LoRAs, and fine-tuned controls.',
    icon: MagicStar,
    badge: 'IMG',
  },
  {
    type: 'skyImageEdits',
    label: 'Image Editor',
    description: 'Apply targeted edits to images with prompt-driven inpainting and refinement.',
    icon: Brush2,
    badge: 'EDIT',
  },
  {
    type: 'skyVideo',
    label: 'Video Generator',
    description:
      'Generate videos from images with pose/face control, motion transfer, and reference video guidance.',
    icon: VideoPlay,
    badge: 'VID',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const } },
};

export function NodePalette() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-full w-64 bg-content1 border-r border-divider">
      {/* Header */}
      <div className="px-5 py-4 border-b border-divider">
        <h2 className="text-sm font-semibold text-foreground">Nodes</h2>
        <p className="text-[11px] text-default-400 mt-0.5">Drag onto canvas to add</p>
      </div>

      {/* Node Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2.5 p-4 overflow-y-auto scrollbar-hide"
      >
        {PALETTE_ITEMS.map(item => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.type}
              variants={itemVariants}
              draggable
              onDragStart={e => onDragStart(e as unknown as DragEvent<HTMLDivElement>, item.type)}
              className={`
                group relative cursor-grab active:cursor-grabbing
                rounded-xl p-3
                bg-default-50 dark:bg-default-50 border border-divider
                hover:bg-default-100 dark:hover:bg-default-100 hover:border-default-300 dark:hover:border-default-200
                shadow-sm
                transition-all duration-200
                active:scale-[0.97]
              `}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-default-200/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-default-200 dark:bg-default-100">
                  <Icon size={18} variant="Bold" className="text-foreground" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-foreground truncate">{item.label}</h3>
                    <span className="flex-shrink-0 px-1.5 py-px text-[8px] font-bold tracking-wider uppercase rounded-full border bg-default-100 text-default-500 border-default-200">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-default-400 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Footer hint */}
      <div className="mt-auto px-5 py-3 border-t border-divider">
        <p className="text-[10px] text-default-300 text-center">Connect nodes to build pipelines</p>
      </div>
    </div>
  );
}

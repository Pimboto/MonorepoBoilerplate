'use client';

import { Handle, type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { motion } from 'framer-motion';
import { MagicStar } from 'iconsax-reactjs';
import { useCallback } from 'react';
import type { SkyPlaygroundParams } from '../types';

type SkyPlaygroundNodeProps = NodeProps & {
  data: SkyPlaygroundParams;
};

export function SkyPlaygroundNode({ data, id, selected }: SkyPlaygroundNodeProps) {
  const { setNodes } = useReactFlow();

  const handleChange = useCallback(
    (field: keyof SkyPlaygroundParams, value: unknown) => {
      setNodes(nds =>
        nds.map(n => (n.id === id ? { ...n, data: { ...n.data, [field]: value } } : n)),
      );
    },
    [id, setNodes],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`
        group relative w-80 rounded-2xl
        bg-content1 backdrop-blur-2xl
        border border-divider
        shadow-medium
        transition-shadow duration-300
        ${selected ? 'ring-2 ring-primary/50 shadow-lg' : ''}
      `}
    >
      {/* Header */}
      <div className="relative flex items-center gap-3 px-4 py-3 border-b border-divider">
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-default-200 dark:bg-default-100">
          <MagicStar size={16} variant="Bold" className="text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">Image Transform</h3>
          <p className="text-[10px] text-default-400 font-medium tracking-wide uppercase">
            Playground
          </p>
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-default-100 text-default-500 border border-default-200">
          IMG
        </span>
      </div>

      {/* Body */}
      <div className="relative px-4 py-3 flex flex-col gap-3">
        {/* Prompt */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
            Prompt
          </span>
          <textarea
            value={data.positive_prompt}
            onChange={e => handleChange('positive_prompt', e.target.value)}
            placeholder="Describe the transformation..."
            rows={2}
            className="
              w-full resize-none rounded-xl px-3 py-2
              bg-default-100 dark:bg-default-50 border border-divider
              text-xs text-foreground placeholder:text-default-300
              focus:outline-none focus:border-primary/40 focus:bg-default-200 dark:focus:bg-default-100
              transition-all duration-200
              nodrag nopan
            "
          />
        </div>

        {/* Sliders Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Denoise */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                Denoise
              </span>
              <span className="text-[10px] font-mono text-foreground">
                {data.denoise.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={data.denoise}
              onChange={e => handleChange('denoise', Number.parseFloat(e.target.value))}
              className="
                w-full h-1 rounded-full appearance-none cursor-pointer
                bg-default-200 dark:bg-default-100
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-foreground
                nodrag nopan
              "
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                Steps
              </span>
              <span className="text-[10px] font-mono text-foreground">{data.steps}</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={data.steps}
              onChange={e => handleChange('steps', Number.parseInt(e.target.value, 10))}
              className="
                w-full h-1 rounded-full appearance-none cursor-pointer
                bg-default-200 dark:bg-default-100
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-foreground
                nodrag nopan
              "
            />
          </div>
        </div>

        {/* CFG & Seed Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* CFG */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                CFG
              </span>
              <span className="text-[10px] font-mono text-foreground">{data.cfg.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={data.cfg}
              onChange={e => handleChange('cfg', Number.parseFloat(e.target.value))}
              className="
                w-full h-1 rounded-full appearance-none cursor-pointer
                bg-default-200 dark:bg-default-100
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-foreground
                nodrag nopan
              "
            />
          </div>

          {/* Seed */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
              Seed
            </span>
            <input
              type="number"
              value={data.seed}
              onChange={e => handleChange('seed', Number.parseInt(e.target.value, 10))}
              className="
                w-full rounded-lg px-2.5 py-1.5
                bg-default-100 dark:bg-default-50 border border-divider
                text-xs text-foreground font-mono
                focus:outline-none focus:border-primary/40
                transition-all duration-200
                nodrag nopan
              "
            />
          </div>
        </div>
      </div>

      {/* Input Handle - Left */}
      <Handle
        type="target"
        position={Position.Left}
        id="image-in"
        className="
          !w-3.5 !h-3.5 !rounded-full !border-2
          !border-default-400 !bg-default-300
          hover:!bg-default-500
          !transition-all !duration-200
          !-left-[7px]
        "
      />

      {/* Output Handle - Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="image-out"
        className="
          !w-3.5 !h-3.5 !rounded-full !border-2
          !border-default-400 !bg-default-300
          hover:!bg-default-500
          !transition-all !duration-200
          !-right-[7px]
        "
      />
    </motion.div>
  );
}

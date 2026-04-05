'use client';

import { Handle, type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { motion } from 'framer-motion';
import { VideoPlay } from 'iconsax-reactjs';
import { useCallback } from 'react';
import type { SkyVideoParams } from '../types';

type SkyVideoNodeProps = NodeProps & {
  data: SkyVideoParams;
};

export function SkyVideoNode({ data, id, selected }: SkyVideoNodeProps) {
  const { setNodes } = useReactFlow();

  const handleChange = useCallback(
    (field: keyof SkyVideoParams, value: unknown) => {
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
          <VideoPlay size={16} variant="Bold" className="text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">Video Generator</h3>
          <p className="text-[10px] text-default-400 font-medium tracking-wide uppercase">Video</p>
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-full bg-default-100 text-default-500 border border-default-200">
          VID
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
            placeholder="Describe the video..."
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

        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
            Resolution
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.width}
              onChange={e => handleChange('width', Number.parseInt(e.target.value, 10))}
              className="
                w-full rounded-lg px-2.5 py-1.5
                bg-default-100 dark:bg-default-50 border border-divider
                text-xs text-foreground font-mono text-center
                focus:outline-none focus:border-primary/40
                transition-all duration-200
                nodrag nopan
              "
            />
            <span className="text-default-400 text-xs font-medium flex-shrink-0">x</span>
            <input
              type="number"
              value={data.height}
              onChange={e => handleChange('height', Number.parseInt(e.target.value, 10))}
              className="
                w-full rounded-lg px-2.5 py-1.5
                bg-default-100 dark:bg-default-50 border border-divider
                text-xs text-foreground font-mono text-center
                focus:outline-none focus:border-primary/40
                transition-all duration-200
                nodrag nopan
              "
            />
          </div>
        </div>

        {/* Frames & FPS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                Frames
              </span>
              <span className="text-[10px] font-mono text-foreground">{data.num_frames}</span>
            </div>
            <input
              type="number"
              value={data.num_frames}
              onChange={e => handleChange('num_frames', Number.parseInt(e.target.value, 10))}
              min="1"
              max="200"
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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                FPS
              </span>
              <span className="text-[10px] font-mono text-foreground">{data.frame_rate}</span>
            </div>
            <input
              type="number"
              value={data.frame_rate}
              onChange={e => handleChange('frame_rate', Number.parseInt(e.target.value, 10))}
              min="1"
              max="60"
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

        {/* Pose & Face Strength */}
        <div className="grid grid-cols-2 gap-3">
          {/* Pose Strength */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                Pose
              </span>
              <span className="text-[10px] font-mono text-foreground">
                {data.pose_strength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={data.pose_strength}
              onChange={e => handleChange('pose_strength', Number.parseFloat(e.target.value))}
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

          {/* Face Strength */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-default-500 uppercase tracking-wider">
                Face
              </span>
              <span className="text-[10px] font-mono text-foreground">
                {data.face_strength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={data.face_strength}
              onChange={e => handleChange('face_strength', Number.parseFloat(e.target.value))}
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

        {/* Steps & CFG */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </div>

      {/* Input Handle - Left Top (Image) */}
      <Handle
        type="target"
        position={Position.Left}
        id="image-in"
        className="
          !w-3.5 !h-3.5 !rounded-full !border-2
          !border-default-400 !bg-default-300
          hover:!bg-default-500
          !transition-all !duration-200
          !-left-[7px] !top-[30%]
        "
      />

      {/* Input Handle - Left Bottom (Reference Video) */}
      <Handle
        type="target"
        position={Position.Left}
        id="video-ref-in"
        className="
          !w-3.5 !h-3.5 !rounded-full !border-2
          !border-default-400 !bg-default-300
          hover:!bg-default-500
          !transition-all !duration-200
          !-left-[7px] !top-[70%]
        "
      />

      {/* Output Handle - Right */}
      <Handle
        type="source"
        position={Position.Right}
        id="video-out"
        className="
          !w-3.5 !h-3.5 !rounded-full !border-2
          !border-default-400 !bg-default-300
          hover:!bg-default-500
          !transition-all !duration-200
          !-right-[7px]
        "
      />

      {/* Handle Labels */}
      <div className="absolute -left-1 top-[30%] -translate-x-full -translate-y-1/2 pr-2">
        <span className="text-[8px] font-medium text-default-400 uppercase tracking-wider">
          img
        </span>
      </div>
      <div className="absolute -left-1 top-[70%] -translate-x-full -translate-y-1/2 pr-2">
        <span className="text-[8px] font-medium text-default-400 uppercase tracking-wider">
          ref
        </span>
      </div>
      <div className="absolute -right-1 top-1/2 translate-x-full -translate-y-1/2 pl-2">
        <span className="text-[8px] font-medium text-default-400 uppercase tracking-wider">
          out
        </span>
      </div>
    </motion.div>
  );
}

import type { Edge, Node } from '@xyflow/react';

export type LoraConfig = {
  name: string;
  strength: number;
};

export type SkyPlaygroundParams = {
  [key: string]: unknown;
  mode: 'sky_playground';
  image: string;
  positive_prompt: string;
  negative_prompt: string;
  seed: number;
  steps: number;
  cfg: number;
  denoise: number;
  sampler_name: string;
  scheduler: string;
  loras: LoraConfig[];
  model_name: string;
  clip_name: string;
  vae_name: string;
  output_s3: string | null;
};

export type SkyImageEditsParams = {
  [key: string]: unknown;
  mode: 'sky_image_edits';
  image: string;
  positive_prompt: string;
  negative_prompt: string;
  seed: number;
  steps: number;
  cfg: number;
  sampler_name: string;
  model_name: string;
  clip_name: string;
  vae_name: string;
  output_s3: string | null;
};

export type SkyVideoParams = {
  [key: string]: unknown;
  mode: 'sky_video';
  image: string;
  reference_video: string;
  positive_prompt: string;
  seed: number;
  steps: number;
  cfg: number;
  shift: number;
  denoise_strength: number;
  scheduler: string;
  num_frames: number;
  width: number;
  height: number;
  frame_rate: number;
  pose_strength: number;
  face_strength: number;
  force_offload: boolean;
  loras: LoraConfig[];
  model_name: string;
  vae_name: string;
  text_encoder_name: string;
  clip_vision_name: string;
  output_s3: string | null;
};

export type WorkflowNodeData = SkyPlaygroundParams | SkyImageEditsParams | SkyVideoParams;

export type WorkflowNode = Node<WorkflowNodeData>;

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string | null;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
};

export type WorkflowGql = {
  id: string;
  name: string;
  description: string | null;
  nodes: unknown;
  edges: unknown;
  createdAt: string;
  updatedAt: string;
};

export const SAMPLER_OPTIONS = [
  'euler',
  'euler_ancestral',
  'heun',
  'heunpp2',
  'dpm_2',
  'dpm_2_ancestral',
  'lms',
  'dpm_fast',
  'dpm_adaptive',
  'dpmpp_2s_ancestral',
  'dpmpp_sde',
  'dpmpp_sde_gpu',
  'dpmpp_2m',
  'dpmpp_2m_sde',
  'dpmpp_2m_sde_gpu',
  'dpmpp_3m_sde',
  'dpmpp_3m_sde_gpu',
  'ddpm',
  'lcm',
  'ipndm',
  'ipndm_v',
  'deis',
  'uni_pc',
  'uni_pc_bh2',
] as const;

export const SCHEDULER_OPTIONS = [
  'normal',
  'karras',
  'exponential',
  'sgm_uniform',
  'simple',
  'ddim_uniform',
  'beta',
] as const;

export const VIDEO_SCHEDULER_OPTIONS = [...SCHEDULER_OPTIONS, 'dpm++_sde/beta'] as const;

export function createDefaultPlaygroundParams(): SkyPlaygroundParams {
  return {
    mode: 'sky_playground',
    image: '',
    positive_prompt: '',
    negative_prompt: '',
    seed: -1,
    steps: 20,
    cfg: 7,
    denoise: 0.75,
    sampler_name: 'euler',
    scheduler: 'normal',
    loras: [],
    model_name: '',
    clip_name: '',
    vae_name: '',
    output_s3: null,
  };
}

export function createDefaultImageEditsParams(): SkyImageEditsParams {
  return {
    mode: 'sky_image_edits',
    image: '',
    positive_prompt: '',
    negative_prompt: '',
    seed: -1,
    steps: 12,
    cfg: 7,
    sampler_name: 'euler',
    model_name: '',
    clip_name: '',
    vae_name: '',
    output_s3: null,
  };
}

export function createDefaultVideoParams(): SkyVideoParams {
  return {
    mode: 'sky_video',
    image: '',
    reference_video: '',
    positive_prompt: '',
    seed: -1,
    steps: 30,
    cfg: 7,
    shift: 7,
    denoise_strength: 1.0,
    scheduler: 'normal',
    num_frames: 81,
    width: 512,
    height: 768,
    frame_rate: 24,
    pose_strength: 1.0,
    face_strength: 1.0,
    force_offload: false,
    loras: [],
    model_name: '',
    vae_name: '',
    text_encoder_name: '',
    clip_vision_name: '',
    output_s3: null,
  };
}

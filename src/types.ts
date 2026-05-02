export type MarketplaceMe = {
  id_user: string
  username: string
  email: string
  avatar_url?: string | null
  aipoints: number
  airank?: number
}

export const MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  'poolside/laguna-xs.2:free',
  'poolside/laguna-m.1:free',
  'inclusionai/ling-2.6-1t:free',
  'tencent/hy3-preview:free',
  'baidu/qianfan-ocr-fast:free',
  'google/gemma-4-26b-a4b-it:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'minimax/minimax-m2.5:free',
  'liquid/lfm-2.5-1.2b-thinking:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'openai/gpt-oss-120b:free'
]

export default undefined

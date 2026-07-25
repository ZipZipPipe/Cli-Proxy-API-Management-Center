import type { ProviderKeyConfig } from '@/types';

export const CLAUDE_API_DISPLAY_NAME = 'ClaudeAPI';
export const CLAUDE_API_BASE_URL = '';
export const CLAUDE_API_LEGACY_BASE_URL = '';
export const CLAUDE_API_AFFILIATE_URL = '';

const normalizeBaseUrl = (value: string | undefined | null): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '');

export const isClaudeApiProvider = (config: ProviderKeyConfig | undefined | null): boolean => {
  if (!config) return false;
  const candidates = [CLAUDE_API_BASE_URL, CLAUDE_API_LEGACY_BASE_URL]
    .map(normalizeBaseUrl)
    .filter(Boolean);
  if (candidates.length === 0) return false;
  const baseUrl = normalizeBaseUrl(config.baseUrl);
  return candidates.some((candidate) => baseUrl === candidate);
};

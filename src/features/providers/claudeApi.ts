import type { ProviderKeyConfig } from '@/types';

export const CLAUDE_API_DISPLAY_NAME = 'ClaudeAPI';
export const CLAUDE_API_BASE_URL = 'https://gw.claudeapi.com';
export const CLAUDE_API_AFFILIATE_URL = '';

const normalizeBaseUrl = (value: string | undefined | null): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\/+$/, '');

export const isClaudeApiProvider = (
  config: ProviderKeyConfig | undefined | null
): boolean => {
  if (!config) return false;
  const normalizedBaseUrl = normalizeBaseUrl(CLAUDE_API_BASE_URL);
  return normalizedBaseUrl ? normalizeBaseUrl(config.baseUrl) === normalizedBaseUrl : false;
};

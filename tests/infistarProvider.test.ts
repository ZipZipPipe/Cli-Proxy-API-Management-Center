import { describe, expect, test } from 'bun:test';
import { infistarToResource } from '../src/features/providers/adapters';
import { PROVIDER_LOGOS } from '../src/features/providers/brandLogos';
import { PROVIDER_BRAND_ORDER } from '../src/features/providers/descriptors';
import {
  INFISTAR_AFFILIATE_URL,
  INFISTAR_BASE_URL_OPTIONS,
  INFISTAR_DOMESTIC_BASE_URL,
  INFISTAR_DOMESTIC_ROOT_URL,
  INFISTAR_GLOBAL_BASE_URL,
  INFISTAR_GLOBAL_ROOT_URL,
  buildInfistarRaw,
  getInfistarProtocolUrls,
  resolveInfistarBaseUrl,
} from '../src/features/providers/infistar';
import { getSponsorProviderDefinition } from '../src/features/providers/sponsorDefinitions';

const allProtocolConfig = {
  openaiCompatibility: [
    {
      name: 'infistar',
      baseUrl: INFISTAR_DOMESTIC_BASE_URL,
      apiKeyEntries: [{ apiKey: 'openai-key' }],
    },
  ],
  claudeApiKeys: [{ apiKey: 'claude-key', baseUrl: INFISTAR_DOMESTIC_ROOT_URL }],
  codexApiKeys: [{ apiKey: 'codex-key', baseUrl: INFISTAR_DOMESTIC_BASE_URL }],
  geminiApiKeys: [{ apiKey: 'gemini-key', baseUrl: INFISTAR_DOMESTIC_ROOT_URL }],
  interactionsApiKeys: [{ apiKey: 'interactions-key', baseUrl: INFISTAR_DOMESTIC_BASE_URL }],
};

describe('Infistar sponsor provider', () => {
  test('does not ship third-party relay URLs', () => {
    expect(INFISTAR_AFFILIATE_URL).toBe('');
    expect(INFISTAR_DOMESTIC_ROOT_URL).toBe('');
    expect(INFISTAR_GLOBAL_ROOT_URL).toBe('');
    expect(INFISTAR_DOMESTIC_BASE_URL).toBe('');
    expect(INFISTAR_GLOBAL_BASE_URL).toBe('');
    expect(
      INFISTAR_BASE_URL_OPTIONS.map(({ id, baseUrl }) => ({
        id,
        baseUrl,
      }))
    ).toEqual([
      { id: 'mainlandChina', baseUrl: '' },
      { id: 'global', baseUrl: '' },
    ]);
    expect(resolveInfistarBaseUrl(undefined)).toBe(INFISTAR_DOMESTIC_BASE_URL);
    expect(resolveInfistarBaseUrl(INFISTAR_GLOBAL_ROOT_URL)).toBe(INFISTAR_GLOBAL_BASE_URL);
  });

  test('keeps all bundled protocol endpoints empty', () => {
    expect(getInfistarProtocolUrls(undefined)).toEqual({
      openai: '',
      codex: '',
      anthropic: '',
      gemini: '',
    });
    expect(getInfistarProtocolUrls(INFISTAR_GLOBAL_BASE_URL)).toEqual({
      openai: '',
      codex: '',
      anthropic: '',
      gemini: '',
    });

    const definition = getSponsorProviderDefinition('infistar');
    expect(definition.protocols).toEqual(['openai', 'claude', 'gemini', 'codex']);
    expect(definition.protocols).not.toContain('interactions');
  });

  test('does not aggregate removed third-party endpoints', () => {
    const raw = buildInfistarRaw(allProtocolConfig);

    expect(raw.openai).toEqual([]);
    expect(raw.claude).toEqual([]);
    expect(raw.codex).toEqual([]);
    expect(raw.gemini).toEqual([]);
    expect(infistarToResource(raw)).toBeNull();
  });

  test('keeps custom endpoints outside the Infistar sponsor group', () => {
    const raw = buildInfistarRaw({
      openaiCompatibility: [
        {
          name: 'infistar',
          baseUrl: 'https://gateway.example.com/v1',
          apiKeyEntries: [{ apiKey: 'custom-key' }],
        },
      ],
    });

    expect(raw.openai).toEqual([]);
  });

  test('is appended to the provider catalog with the supplied logo', () => {
    expect(PROVIDER_BRAND_ORDER.at(-1)).toBe('infistar');
    expect(PROVIDER_LOGOS.infistar.src).toContain('infistar.png');
    expect(PROVIDER_LOGOS.infistar.transparent).toBeTrue();
  });
});

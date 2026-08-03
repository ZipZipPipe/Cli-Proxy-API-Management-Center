import { describe, expect, test } from 'bun:test';
import { lmuAIToResource } from '../src/features/providers/adapters';
import { PROVIDER_LOGOS } from '../src/features/providers/brandLogos';
import { PROVIDER_BRAND_ORDER } from '../src/features/providers/descriptors';
import {
  LMU_AI_AFFILIATE_URL,
  LMU_AI_BASE_URL,
  LMU_AI_BASE_URL_OPTIONS,
  LMU_AI_OPENAI_BASE_URL,
  buildLmuAIRaw,
  getLmuAIProtocolUrls,
} from '../src/features/providers/lmuAI';
import { getSponsorProviderDefinition } from '../src/features/providers/sponsorDefinitions';

const allProtocolConfig = {
  openaiCompatibility: [
    {
      name: 'lmuAI',
      baseUrl: LMU_AI_OPENAI_BASE_URL,
      apiKeyEntries: [{ apiKey: 'openai-key' }],
    },
  ],
  claudeApiKeys: [{ apiKey: 'claude-key', baseUrl: LMU_AI_BASE_URL }],
  codexApiKeys: [{ apiKey: 'codex-key', baseUrl: LMU_AI_OPENAI_BASE_URL }],
  geminiApiKeys: [{ apiKey: 'gemini-key', baseUrl: LMU_AI_BASE_URL }],
  interactionsApiKeys: [{ apiKey: 'interactions-key', baseUrl: LMU_AI_BASE_URL }],
};

describe('LMU AI provider', () => {
  test('does not ship third-party relay URLs', () => {
    expect(LMU_AI_AFFILIATE_URL).toBe('');
    expect(LMU_AI_BASE_URL).toBe('');
    expect(LMU_AI_OPENAI_BASE_URL).toBe('');
    expect(getLmuAIProtocolUrls(undefined)).toEqual({
      openai: '',
      codex: '',
      anthropic: '',
      gemini: '',
    });
    expect(
      LMU_AI_BASE_URL_OPTIONS.every((option) =>
        [
          option.baseUrl,
          option.openaiBaseUrl,
          option.codexBaseUrl,
          option.anthropicBaseUrl,
          option.geminiBaseUrl,
        ].every((value) => value === '')
      )
    ).toBe(true);

    const definition = getSponsorProviderDefinition('lmuAI');
    expect(definition.protocols).toEqual(['openai', 'claude', 'gemini', 'codex']);
    expect(definition.protocols).not.toContain('interactions');
  });

  test('does not aggregate removed third-party endpoints', () => {
    const raw = buildLmuAIRaw(allProtocolConfig);

    expect(raw.openai).toEqual([]);
    expect(raw.claude).toEqual([]);
    expect(raw.codex).toEqual([]);
    expect(raw.gemini).toEqual([]);
    expect(lmuAIToResource(raw)).toBeNull();
  });

  test('keeps custom endpoints outside the LMU AI sponsor group', () => {
    const raw = buildLmuAIRaw({
      openaiCompatibility: [
        {
          name: 'lmuAI',
          baseUrl: 'https://gateway.example.com/v1',
          apiKeyEntries: [{ apiKey: 'custom-key' }],
        },
      ],
    });

    expect(raw.openai).toEqual([]);
  });

  test('is appended after the existing providers with the sponsor logo', () => {
    expect(PROVIDER_BRAND_ORDER.at(-1)).toBe('lmuAI');
    expect(PROVIDER_LOGOS.lmuAI.src).toContain('lmu-ai.png');
  });
});

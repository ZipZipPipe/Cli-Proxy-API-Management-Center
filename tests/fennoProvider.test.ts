import { describe, expect, test } from 'bun:test';
import {
  buildFennoAIRaw,
  FENNO_AI_BASE_URL_OPTIONS,
  FENNO_AI_CODEX_BASE_URL,
  FENNO_AI_PROVIDER_NAME,
} from '../src/features/providers/fennoAI';
import { getSponsorProviderDefinition } from '../src/features/providers/sponsorDefinitions';

describe('FennoAI provider aggregation', () => {
  test('does not ship or match third-party relay URLs', () => {
    const raw = buildFennoAIRaw({
      openaiCompatibility: [
        {
          name: FENNO_AI_PROVIDER_NAME,
          baseUrl: FENNO_AI_CODEX_BASE_URL,
          apiKeyEntries: [{ apiKey: 'openai-key' }],
        },
      ],
      codexApiKeys: [{ apiKey: 'codex-key', baseUrl: FENNO_AI_CODEX_BASE_URL }],
    });

    expect(getSponsorProviderDefinition('fennoAI').protocols).toEqual(['codex', 'claude']);
    expect(
      FENNO_AI_BASE_URL_OPTIONS.every((option) =>
        Object.values(option).every((value) => value === 'standard' || value === '')
      )
    ).toBe(true);
    expect(raw.openai).toEqual([]);
    expect(raw.codex).toEqual([]);
  });
});

import { describe, expect, test } from 'bun:test';
import {
  CLAUDE_API_AFFILIATE_URL,
  CLAUDE_API_BASE_URL,
  CLAUDE_API_LEGACY_BASE_URL,
} from '../src/features/providers/claudeApi';
import {
  KIMI_CHINESE_AFFILIATE_URL,
  KIMI_INTERNATIONAL_AFFILIATE_URL,
} from '../src/features/providers/kimi';
import { SPONSOR_DEFINITIONS } from '../src/features/providers/sponsorDefinitions';

const FIRST_PARTY_MODEL_VENDOR_BRANDS = new Set(['kimi']);

const definitionUrls = (
  definition: (typeof SPONSOR_DEFINITIONS)[keyof typeof SPONSOR_DEFINITIONS]
) =>
  definition.baseUrlOptions.flatMap((option) => [
    option.baseUrl,
    option.openaiBaseUrl,
    option.codexBaseUrl,
    option.anthropicBaseUrl,
    option.geminiBaseUrl,
  ]);

describe('third-party relay exposure policy', () => {
  test('requires review before any non-first-party sponsor can ship URLs', () => {
    for (const definition of Object.values(SPONSOR_DEFINITIONS)) {
      expect(definition.affiliateUrl ?? '').toBe('');
      expect(definition.dashboardUrl ?? '').toBe('');

      if (!FIRST_PARTY_MODEL_VENDOR_BRANDS.has(definition.brand)) {
        expect(definitionUrls(definition).every((value) => value === '')).toBe(true);
      }
    }
  });

  test('keeps standalone relay and registration URLs removed', () => {
    expect([
      CLAUDE_API_BASE_URL,
      CLAUDE_API_LEGACY_BASE_URL,
      CLAUDE_API_AFFILIATE_URL,
      KIMI_CHINESE_AFFILIATE_URL,
      KIMI_INTERNATIONAL_AFFILIATE_URL,
    ]).toEqual(['', '', '', '', '']);
  });

  test('keeps the promotional quick-start route removed', async () => {
    const sources = await Promise.all(
      [
        'src/router/MainRoutes.tsx',
        'src/components/layout/MainLayout.tsx',
        'src/features/dashboard/DashboardPage.tsx',
      ].map((path) => Bun.file(path).text())
    );

    for (const source of sources) {
      expect(source).not.toContain('/quick-start');
    }
  });
});

import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CLAUDE_API_AFFILIATE_URL,
  CLAUDE_API_BASE_URL,
  CLAUDE_API_LEGACY_BASE_URL,
} from '../src/features/providers/claudeApi';
import {
  KIMI_CHINESE_AFFILIATE_URL,
  KIMI_INTERNATIONAL_AFFILIATE_URL,
} from '../src/features/providers/kimi';
import { SPONSORS } from '../src/features/config/sponsors';
import { PROVIDER_LOGOS } from '../src/features/providers/brandLogos';
import {
  PROVIDER_BRAND_ORDER,
  THIRD_PARTY_CHANNEL_BRANDS,
} from '../src/features/providers/descriptors';
import { SPONSOR_DEFINITIONS } from '../src/features/providers/sponsorDefinitions';
import { ProviderCategoryList } from '../src/features/providers/components/ProviderCategoryList';
import { ProviderResourcePanel } from '../src/features/providers/components/ProviderResourcePanel';

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
  test('removes every third-party channel from the visible provider catalog', () => {
    const expectedThirdPartyBrands = [
      'claudeApi',
      ...Object.values(SPONSOR_DEFINITIONS)
        .filter((definition) => !FIRST_PARTY_MODEL_VENDOR_BRANDS.has(definition.brand))
        .map((definition) => definition.brand),
    ].sort();

    expect(Array.from(THIRD_PARTY_CHANNEL_BRANDS).sort()).toEqual(expectedThirdPartyBrands);
    for (const brand of THIRD_PARTY_CHANNEL_BRANDS) {
      expect(PROVIDER_BRAND_ORDER).not.toContain(brand);
      expect(PROVIDER_LOGOS[brand]).toBeUndefined();
    }
  });

  test('keeps configuration sponsor links removed', () => {
    expect(SPONSORS).toEqual([]);
  });

  test('renders only the allowed provider categories without relay names or logos', () => {
    const markup = renderToStaticMarkup(
      createElement(ProviderCategoryList, {
        groups: PROVIDER_BRAND_ORDER.map((id) => ({ id, resources: [] })),
        activeBrand: 'kimi',
        onSelect: () => {},
      })
    );

    expect(markup.match(/<button\b/g)?.length).toBe(PROVIDER_BRAND_ORDER.length);
    expect(markup).toContain('providersPage.providerNames.kimi');
    expect(markup).toContain('providersPage.providerNames.codex');
    for (const brand of THIRD_PARTY_CHANNEL_BRANDS) {
      expect(markup.toLowerCase()).not.toContain(brand.toLowerCase());
    }
  });

  test('renders the Kimi provider panel without registration links or promotional text', () => {
    const markup = renderToStaticMarkup(
      createElement(ProviderResourcePanel, {
        group: { id: 'kimi', resources: [] },
        filter: '',
        filteredResources: [],
        selectedId: null,
        onFilterChange: () => {},
        onView: () => {},
        onEdit: () => {},
        onDelete: () => {},
        onCreate: () => {},
      })
    );

    expect(markup).toContain('providersPage.providerNames.kimi');
    expect(markup).toContain('providersPage.actions.new');
    expect(markup).not.toMatch(/<a\b|kimiPromo|providersPage\.sponsor/);
  });

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

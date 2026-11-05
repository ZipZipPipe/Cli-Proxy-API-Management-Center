import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import en from '../src/i18n/locales/en.json';
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
const i18n = createInstance();
await i18n.init({ lng: 'en', resources: { en: { translation: en } } });
const render = (element: ReturnType<typeof createElement>) =>
  renderToStaticMarkup(createElement(I18nextProvider, { i18n }, element));

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
    const markup = render(
      createElement(ProviderCategoryList, {
        groups: [...PROVIDER_BRAND_ORDER, ...THIRD_PARTY_CHANNEL_BRANDS].map((id) => ({
          id,
          resources: [],
        })),
        activeBrand: 'kimi',
        onSelect: () => {},
      })
    );

    expect(markup.match(/<button\b/g)?.length).toBe(PROVIDER_BRAND_ORDER.length);
    expect(markup).toContain('>Kimi<');
    expect(markup).toContain('>Codex<');
    for (const brand of THIRD_PARTY_CHANNEL_BRANDS) {
      expect(markup.toLowerCase()).not.toContain(brand.toLowerCase());
    }
  });

  test('renders the Kimi provider panel without registration links or promotional text', () => {
    const markup = render(
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

    expect(markup).toContain('>Kimi<');
    expect(markup).toContain('>New<');
    expect(markup).not.toMatch(/<a\b|kimiPromo|providersPage\.sponsor/);
    expect(markup).not.toContain(en.providersPage.sponsor.kimiPromo);
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
    expect([KIMI_CHINESE_AFFILIATE_URL, KIMI_INTERNATIONAL_AFFILIATE_URL]).toEqual(['', '']);
  });

  test('keeps the promotional quick-start route removed', async () => {
    const sources = await Promise.all(
      [
        'src/router/MainRoutes.tsx',
        'src/components/layout/MainLayout.tsx',
        'src/features/dashboard/DashboardPage.tsx',
        'src/features/providers/ProvidersWorkbenchPage.tsx',
      ].map((path) => Bun.file(path).text())
    );

    for (const source of sources) {
      expect(source).not.toContain('/quick-start');
      expect(source).not.toContain('SponsorCampaignCard');
      expect(source).not.toContain('SponsorQuickStartPanel');
    }
  });
});

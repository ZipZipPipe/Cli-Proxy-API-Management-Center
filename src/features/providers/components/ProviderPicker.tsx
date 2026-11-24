import { useTranslation } from 'react-i18next';
import { IconChevronLeft } from '@/components/ui/icons';
import { THIRD_PARTY_CHANNEL_BRANDS } from '../descriptors';
import { connectionCounts, getConnectionFormTarget } from '../resourceView';
import type { ProviderBrand, ProviderGroup } from '../types';
import { BrandLogo } from './BrandLogo';
import styles from './ProviderPicker.module.scss';

interface ProviderPickerProps {
  groups: ProviderGroup[];
  /** `page` lays the catalogue out wide for first-run onboarding. */
  variant?: 'sheet' | 'page';
  onPick: (brand: ProviderBrand) => void;
}

const CUSTOM_BRANDS: ReadonlySet<ProviderBrand> = new Set(['openaiCompatibility']);

export function ProviderPicker({
  groups: providerGroups,
  variant = 'sheet',
  onPick,
}: ProviderPickerProps) {
  const { t } = useTranslation();
  const groups = providerGroups.filter((group) => !THIRD_PARTY_CHANNEL_BRANDS.has(group.id));
  const countOf = (brand: ProviderBrand) => {
    const group = groups.find((item) => item.id === brand);
    return group ? connectionCounts(group).total : 0;
  };
  const available = new Set(groups.map((group) => group.id));
  const official = groups
    .map((group) => group.id)
    .filter((brand) => !CUSTOM_BRANDS.has(brand) && brand !== 'kimi');
  const custom = groups.map((group) => group.id).filter((brand) => CUSTOM_BRANDS.has(brand));
  const name = (brand: ProviderBrand) => t(`providersPage.providerNames.${brand}`);
  const connected = (brand: ProviderBrand) => {
    const count = countOf(brand);
    return count > 0 ? (
      <span className={styles.connected}>{t('providersPage.picker.connected', { count })}</span>
    ) : null;
  };

  const actionLabel = (brand: ProviderBrand) => {
    const group = groups.find((item) => item.id === brand);
    return group && getConnectionFormTarget(group).mode === 'edit'
      ? t('providersPage.actions.edit')
      : t('providersPage.picker.connect');
  };

  const kimiCard = (brand: ProviderBrand) => (
    <li key={brand} className={styles.feature}>
      <BrandLogo brand={brand} size={40} />
      <div className={styles.featureMain}>
        <div className={styles.featureTitleLine}>
          <h4 className={styles.featureTitle}>{name(brand)}</h4>
          {connected(brand)}
        </div>
      </div>
      <div className={styles.featureActions}>
        <button
          type="button"
          className={styles.connectButton}
          onClick={() => onPick(brand)}
          aria-label={`${actionLabel(brand)} ${name(brand)}`}
        >
          {actionLabel(brand)}
        </button>
      </div>
    </li>
  );

  const tile = (brand: ProviderBrand) => (
    <li key={brand}>
      <button type="button" className={styles.tile} onClick={() => onPick(brand)}>
        <BrandLogo brand={brand} size={28} />
        <span className={styles.tileName}>{name(brand)}</span>
        {connected(brand)}
        <IconChevronLeft size={14} className={styles.tileChevron} aria-hidden="true" />
      </button>
    </li>
  );

  return (
    <div className={`${styles.picker} ${variant === 'page' ? styles.pickerPage : ''}`}>
      {official.length > 0 || available.has('kimi') ? (
        <section className={styles.section}>
          <h3 className={styles.heading}>{t('providersPage.picker.official')}</h3>
          {available.has('kimi') ? <ul className={styles.features}>{kimiCard('kimi')}</ul> : null}
          <ul className={styles.tiles}>{official.map(tile)}</ul>
        </section>
      ) : null}

      {custom.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.heading}>{t('providersPage.picker.custom')}</h3>
          <ul className={styles.tiles}>{custom.map(tile)}</ul>
        </section>
      ) : null}
    </div>
  );
}

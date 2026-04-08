import { describe, expect, it } from 'vitest';
import i18n from '../src/i18n/config';

describe('i18n', () => {
  it('switches locale resources', async () => {
    await i18n.changeLanguage('ja');
    expect(i18n.t('controls.searchLabel')).toBe('ノード検索');

    await i18n.changeLanguage('en');
    expect(i18n.t('controls.searchLabel')).toBe('Search Nodes');
  });
});

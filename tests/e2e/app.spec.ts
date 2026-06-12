import { expect, test } from '@playwright/test';

test('node click from alternative list opens detail and esc closes', async ({
  page
}) => {
  await page.goto('/ja');
  await page.getByText('ノード一覧（代替操作）').click();
  await page.getByRole('button', { name: /^ノード詳細を開く: 微分$/ }).click();
  await expect(page.getByRole('heading', { name: '微分' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: '微分' })).toHaveCount(0);
});

test('deep link opens detail in English locale', async ({ page }) => {
  await page.goto('/en?node=machine_learning_app');
  await expect(
    page.getByRole('heading', { name: 'Machine Learning' })
  ).toBeVisible();
  await expect(page.getByText('Search Nodes')).toBeVisible();
});

test('mobile viewport uses bottom sheet layout', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only assertion');
  await page.goto('/ja?node=probability');
  const shell = page.getByTestId('detail-panel-shell');
  await expect(shell).toBeVisible();
  await expect(shell).toHaveClass(/fixed/);
});

test('search narrows node list and selection updates share url', async ({
  page
}) => {
  await page.goto('/ja');
  await page.getByLabel('ノード検索').fill('微分');
  await page.getByText('ノード一覧（代替操作）').click();

  const nodeButtons = page.getByRole('button', { name: /^ノード詳細を開く:/ });
  await expect(nodeButtons.first()).toBeVisible();
  const count = await nodeButtons.count();
  expect(count).toBeGreaterThan(0);

  await page.getByRole('button', { name: /^ノード詳細を開く: 微分$/ }).click();
  await expect(page.getByRole('heading', { name: '微分' })).toBeVisible();

  const shareInput = page.getByRole('textbox').last();
  await expect(shareInput).toHaveValue(/node=differentiation/);
});

test('kind filter hides applications from node list', async ({ page }) => {
  await page.goto('/ja');
  await page.getByRole('button', { name: '応用', exact: true }).click();
  await page.getByText('ノード一覧（代替操作）').click();
  await expect(
    page.getByRole('button', { name: /^ノード詳細を開く: 微分$/ })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^ノード詳細を開く: 機械学習$/ })
  ).toHaveCount(0);

  await page.getByRole('button', { name: '絞り込み解除' }).click();
  await expect(
    page.getByRole('button', { name: /^ノード詳細を開く: 機械学習$/ })
  ).toBeVisible();
});

test('filter state restores from shared URL', async ({ page }) => {
  await page.goto('/ja?q=微分&kind=pure_concept');

  await expect(page.getByLabel('ノード検索')).toHaveValue('微分');
  await page.getByText('ノード一覧（代替操作）').click();
  await expect(
    page.getByRole('button', { name: /^ノード詳細を開く: 微分$/ })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /^ノード詳細を開く: 機械学習$/ })
  ).toHaveCount(0);
});

test('changing filters updates the URL for sharing', async ({ page }) => {
  await page.goto('/ja');

  await page.getByLabel('ノード検索').fill('fourier');
  await expect(page).toHaveURL(/q=fourier/);

  // 「応用」を外すと pure_concept のみが URL に載る
  await page.getByRole('button', { name: '応用', exact: true }).click();
  await expect(page).toHaveURL(/kind=pure_concept/);

  // 絞り込み解除でパラメータが消え、URL がクリーンに戻る
  await page.getByRole('button', { name: '絞り込み解除' }).click();
  await expect(page).not.toHaveURL(/q=|kind=/);
});

test('locale switch keeps selected node', async ({ page, isMobile }) => {
  // モバイルでは詳細パネルのオーバーレイがヘッダーを覆うため対象外
  test.skip(Boolean(isMobile), 'Desktop-only assertion');
  await page.goto('/ja?node=differentiation');
  await expect(page.getByRole('heading', { name: '微分' })).toBeVisible();

  await page.getByRole('button', { name: 'English' }).click();
  await expect(
    page.getByRole('heading', { name: 'Differentiation' })
  ).toBeVisible();
  await expect(page).toHaveURL(/\/en\?node=differentiation/);
});

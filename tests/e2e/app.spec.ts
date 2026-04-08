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

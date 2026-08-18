import { expect, test } from '@playwright/test'
import fs from 'fs'
import { fileURLToPath } from 'url'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders and switches dashboard time windows', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Command center for product, revenue, and support' })).toBeVisible()
  await expect(page.getByText('Monthly revenue')).toBeVisible()


  await page.getByRole('tab', { name: '30 days' }).click()
  await expect(page.getByText('Window: 30 days')).toBeVisible()

  await page.getByRole('tab', { name: '90 days' }).click()
  await expect(page.getByText('Window: 90 days')).toBeVisible()

  await page.getByRole('tab', { name: '7 days' }).click()
  await expect(page.getByText('Window: 7 days')).toBeVisible()
})

test('filters orders by segment and search', async ({ page }) => {
  await page.getByRole('button', { name: 'SMB' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(2)

  await page.getByRole('button', { name: 'Enterprise' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(2)

  await page.getByRole('button', { name: 'All' }).click()
  await expect(page.locator('tbody tr')).toHaveCount(5)

  await page.getByLabel('Search orders').fill('Orbital')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.getByRole('row', { name: /ORD-9824/ })).toBeVisible()
})

test('updates the inspector and action note', async ({ page }) => {
  await page.getByLabel('Search orders').fill('Orbital')

  await page.getByRole('button', { name: 'ORD-9824' }).click()
  await expect(page.getByRole('heading', { name: 'Selected order' })).toBeVisible()
  await expect(page.locator('.panel-inspector .inspector-card strong')).toHaveText('Orbital One')

  await page.getByRole('button', { name: 'Approve' }).click()
  await expect(page.locator('.review-note')).toContainText('Approved applied to ORD-9824')

  await page.getByRole('button', { name: 'Flag review' }).click()
  await expect(page.locator('.review-note')).toContainText('Flagged for review applied to ORD-9824')

  await page.getByRole('button', { name: 'Refund' }).click()
  await expect(page.locator('.review-note')).toContainText('Refund queued applied to ORD-9824')

  await page.getByRole('button', { name: 'Compact view' }).click()
  await expect(page.getByRole('button', { name: 'Expanded view' })).toBeVisible()
  await expect(page.locator('main')).toHaveClass(/compact/)
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    const imgDir = new URL('./img/', import.meta.url)
    await fs.promises.mkdir(imgDir, { recursive: true })
    const safeName = testInfo.title.replace(/[^a-z0-9_-]/gi, '_')
    const fileName = fileURLToPath(new URL(`${safeName}-${Date.now()}.png`, imgDir))
    await page.screenshot({ path: fileName, fullPage: true })
  }
})

test('intentional failure to trigger screenshot', async ({ page }) => {
  // Intentionally assert on missing text to force a failure and capture
  await expect(page.getByText('THIS_TEXT_SHOULD_NOT_EXIST')).toBeVisible()
})
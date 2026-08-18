import { expect, test } from '@playwright/test'
import fs from 'fs'
import path from 'path'

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

test('shows default 30-day window with the expected active tab and bars', async ({ page }) => {
  await expect(page.getByRole('tab', { name: '30 days' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByText('Window: 30 days')).toBeVisible()
  await expect(page.locator('.bar-chart .bar-column')).toHaveCount(10)
})

test('updates chart bar counts across 7, 30, and 90 day ranges', async ({ page }) => {
  await page.getByRole('tab', { name: '7 days' }).click()
  await expect(page.locator('.bar-chart .bar-column')).toHaveCount(7)

  await page.getByRole('tab', { name: '30 days' }).click()
  await expect(page.locator('.bar-chart .bar-column')).toHaveCount(10)

  await page.getByRole('tab', { name: '90 days' }).click()
  await expect(page.locator('.bar-chart .bar-column')).toHaveCount(12)
})

test('supports empty and case-insensitive order search', async ({ page }) => {
  await page.getByLabel('Search orders').fill('zzz-notfound')
  await expect(page.locator('tbody tr')).toHaveCount(0)
  await expect(page.getByText('0 visible')).toBeVisible()

  await page.getByLabel('Search orders').fill('orbital')
  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.getByRole('row', { name: /ORD-9824/ })).toBeVisible()
})

test('combines segment and search filters with AND behavior', async ({ page }) => {
  await page.getByRole('button', { name: 'SMB' }).click()
  await page.getByLabel('Search orders').fill('Lumen')

  await expect(page.locator('tbody tr')).toHaveCount(1)
  await expect(page.getByRole('row', { name: /ORD-9815/ })).toBeVisible()
})

test('highlights selected row and updates inspector content', async ({ page }) => {
  await page.getByRole('button', { name: 'ORD-9818' }).click()

  await expect(page.locator('tbody tr', { hasText: 'ORD-9818' })).toHaveClass(/is-selected/)
  await expect(page.locator('.panel-inspector .inspector-card strong')).toHaveText('Northwind')
})

test('applies action to the currently selected order id', async ({ page }) => {
  await page.getByRole('button', { name: 'ORD-9812' }).click()
  await page.getByRole('button', { name: 'Approve' }).click()

  await expect(page.locator('.review-note')).toContainText('Approved applied to ORD-9812')
})

test('toggles compact mode on and off', async ({ page }) => {
  await page.getByRole('button', { name: 'Compact view' }).click()
  await expect(page.getByRole('button', { name: 'Expanded view' })).toBeVisible()
  await expect(page.locator('main')).toHaveClass(/compact/)

  await page.getByRole('button', { name: 'Expanded view' }).click()
  await expect(page.getByRole('button', { name: 'Compact view' })).toBeVisible()
  await expect(page.locator('main')).not.toHaveClass(/compact/)
})

test('renders KPI cards and event stream count from mock data', async ({ page }) => {
  await expect(page.locator('.metric-card')).toHaveCount(4)
  await expect(page.getByText('Monthly revenue')).toBeVisible()
  await expect(page.getByText('$128.4k')).toBeVisible()
  await expect(page.getByText('Active users')).toBeVisible()
  await expect(page.getByText('18,294')).toBeVisible()
  await expect(page.getByText('Avg. response')).toBeVisible()
  await expect(page.getByText('240 ms')).toBeVisible()
  await expect(page.getByText('Open incidents')).toBeVisible()
  await expect(page.locator('.metric-card', { hasText: 'Open incidents' }).locator('strong')).toHaveText('3')

  await expect(page.locator('.activity-list li')).toHaveCount(4)
  await expect(page.getByText('4 entries')).toBeVisible()
})

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    const imgDir = path.join(path.dirname(testInfo.file), 'img')
    await fs.promises.mkdir(imgDir, { recursive: true })
    const safeName = testInfo.title.replace(/[^a-z0-9_-]/gi, '_')
    const fileName = path.join(imgDir, `${safeName}-${Date.now()}.png`)
    await page.screenshot({ path: fileName, fullPage: true })
  }
})

test('intentional failure to trigger screenshot', async ({ page }) => {
  // Intentionally assert on missing text to force a failure and capture
  await expect(page.getByText('THIS_TEXT_SHOULD_NOT_EXIST')).toBeVisible()
})
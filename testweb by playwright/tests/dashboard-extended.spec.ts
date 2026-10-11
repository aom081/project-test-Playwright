import { expect, test } from './fixtures'
import { DashboardPage } from './pages/DashboardPage'
import { chartData, DEFAULT_REVIEW_NOTE, orders, ranges, segments } from './support/data'

/**
 * Extended suite: TC-23 .. TC-37 (see docs/TEST-PLAN.md).
 * Complements tests/dashboard.spec.ts (TC-01 .. TC-22 in SPRS-Test-Cases).
 */

test.describe('Order queue: segments and search', { tag: '@functional' }, () => {
  test('TC-23 Trial segment shows only trial orders', async ({ dashboard }) => {
    await dashboard.selectSegment('Trial')

    await expect(dashboard.rows).toHaveCount(1)
    await expect(dashboard.row('ORD-9818')).toBeVisible()
    await expect(dashboard.visibleBadge).toHaveText('1 visible')
  })

  test('TC-25 only the active segment chip is highlighted', async ({ dashboard }) => {
    for (const active of segments) {
      await dashboard.selectSegment(active)

      for (const chip of segments) {
        const locator = dashboard.segmentChip(chip)
        if (chip === active) await expect(locator).toHaveClass(/is-active/)
        else await expect(locator).not.toHaveClass(/is-active/)
      }
    }
  })

  const searchCases = [
    { query: 'paid', why: 'status', ids: ['ORD-9812', 'ORD-9820'] },
    { query: 'maya', why: 'owner', ids: ['ORD-9812'] },
    { query: '9815', why: 'partial order id', ids: ['ORD-9815'] },
    { query: 'refund', why: 'status', ids: ['ORD-9824'] },
    { query: 'ORD-98', why: 'shared id prefix', ids: orders.map((o) => o.id) },
  ]

  for (const { query, why, ids } of searchCases) {
    test(`TC-26 search matches across fields: "${query}" (${why})`, async ({ dashboard }) => {
      await dashboard.search(query)

      // toHaveText with an array asserts the exact rows, in order.
      await expect(dashboard.rows.locator('.row-button')).toHaveText(ids)
    })
  }

  test('TC-27 search ignores leading and trailing whitespace', async ({ dashboard }) => {
    await dashboard.search('   Lumen   ')

    await expect(dashboard.rows).toHaveCount(1)
    await expect(dashboard.row('ORD-9815')).toBeVisible()
  })

  test('TC-28 "visible" badge tracks every filter change', async ({ dashboard }) => {
    await expect(dashboard.visibleBadge).toHaveText('5 visible')

    await dashboard.selectSegment('Enterprise')
    await expect(dashboard.visibleBadge).toHaveText('2 visible')

    await dashboard.search('zzz-notfound')
    await expect(dashboard.visibleBadge).toHaveText('0 visible')

    await dashboard.searchInput.clear()
    await dashboard.selectSegment('All')
    await expect(dashboard.visibleBadge).toHaveText('5 visible')
  })

  test('TC-34 range, segment and search filters are independent', async ({ dashboard }) => {
    await dashboard.selectSegment('SMB')
    await dashboard.search('Lumen')
    await expect(dashboard.rows).toHaveCount(1)

    await dashboard.selectRange('90 days')

    await expect(dashboard.windowBadge).toHaveText('Window: 90 days')
    await expect(dashboard.rows).toHaveCount(1)
    await expect(dashboard.searchInput).toHaveValue('Lumen')
    await expect(dashboard.segmentChip('SMB')).toHaveClass(/is-active/)
  })
})

test.describe('Order inspector', { tag: '@functional' }, () => {
  test('TC-24 default state selects the first order', async ({ dashboard }) => {
    await expect(dashboard.inspectorCustomer).toHaveText('Atlas Studio')
    await expect(dashboard.inspectorOrderId).toHaveText('ORD-9812')
    await expect(dashboard.inspectorSegmentBadge).toHaveText('Enterprise')
    await expect(dashboard.row('ORD-9812')).toHaveClass(/is-selected/)
    await expect(dashboard.reviewNote).toHaveText(DEFAULT_REVIEW_NOTE)
    await expect(dashboard.rangeTab('30 days')).toHaveAttribute('aria-selected', 'true')
  })

  test('TC-29 inspector keeps the selection when the order is filtered out of the table', async ({ dashboard }) => {
    // ORD-9812 (Enterprise) is selected by default; filter to SMB so it leaves the table.
    await dashboard.selectSegment('SMB')

    await expect(dashboard.rows).toHaveCount(2)
    await expect(dashboard.row('ORD-9812')).toHaveCount(0)
    await expect(dashboard.inspectorCustomer).toHaveText('Atlas Studio')
    await expect(dashboard.inspectorSegmentBadge).toHaveText('Enterprise')
  })

  test('TC-30 clicking anywhere on a row selects it', async ({ dashboard }) => {
    // Click the Customer cell, not the order-id button.
    await dashboard.row('ORD-9820').getByRole('cell').nth(1).click()

    await expect(dashboard.row('ORD-9820')).toHaveClass(/is-selected/)
    await expect(dashboard.inspectorCustomer).toHaveText('Aster Health')
  })

  for (const order of orders) {
    test(`TC-31 inspector shows correct details for ${order.id}`, async ({ dashboard }) => {
      await dashboard.selectOrder(order.id)

      await expect(dashboard.inspectorCustomer).toHaveText(order.customer)
      await expect(dashboard.inspectorOrderId).toHaveText(order.id)
      await expect(dashboard.inspectorSegmentBadge).toHaveText(order.segment)
      await expect(dashboard.inspectorDetails).toHaveText([order.status, order.owner, order.amount])
    })
  }
})

test.describe('Revenue chart', { tag: '@chart' }, () => {
  for (const { key, label } of ranges) {
    test(`TC-32 bar values match the dataset for ${label}`, async ({ dashboard }) => {
      await dashboard.selectRange(label)

      await expect(dashboard.barValues).toHaveText(chartData[key].map(String))
    })

    test(`TC-33 bars are scaled relative to the tallest bar for ${label}`, async ({ dashboard }) => {
      await dashboard.selectRange(label)
      const values = chartData[key]
      await expect(dashboard.bars).toHaveCount(values.length)

      const max = Math.max(...values)
      const expected = values.map((v) => `${Math.max(18, Math.round((v / max) * 100))}%`)
      const actual = await dashboard.barFills.evaluateAll((els) => els.map((el) => (el as HTMLElement).style.height))

      expect(actual).toEqual(expected)
      expect(actual[values.indexOf(max)]).toBe('100%')
    })
  }
})

test.describe('Keyboard and accessibility', { tag: '@a11y' }, () => {
  test('TC-35 date range tabs work with the keyboard', async ({ dashboard }) => {
    const sevenDays = dashboard.rangeTab('7 days')
    await sevenDays.focus()
    await expect(sevenDays).toBeFocused()
    await sevenDays.press('Enter')
    await expect(sevenDays).toHaveAttribute('aria-selected', 'true')
    await expect(dashboard.windowBadge).toHaveText('Window: 7 days')

    const ninetyDays = dashboard.rangeTab('90 days')
    await ninetyDays.focus()
    await ninetyDays.press('Space')
    await expect(ninetyDays).toHaveAttribute('aria-selected', 'true')
    await expect(sevenDays).toHaveAttribute('aria-selected', 'false')

    // Focus order: the last range tab is followed by the search field.
    await ninetyDays.press('Tab')
    await expect(dashboard.searchInput).toBeFocused()
  })
})

test.describe('Stability', { tag: '@regression' }, () => {
  test('TC-36 a full user workflow raises no console or page errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
    })

    // Navigate manually (not via the fixture) so listeners are attached before the first load.
    const dashboard = new DashboardPage(page)
    await dashboard.goto()

    for (const { label } of ranges) await dashboard.selectRange(label)
    for (const segment of segments) await dashboard.selectSegment(segment)
    await dashboard.selectSegment('All')
    await dashboard.search('orbital')
    await dashboard.selectOrder('ORD-9824')
    await dashboard.actionButton('Approve').click()
    await dashboard.actionButton('Flag review').click()
    await dashboard.actionButton('Refund').click()
    await dashboard.compactToggle.click()
    await expect(dashboard.reviewNote).toContainText('Refund queued applied to ORD-9824')

    expect(errors).toEqual([])
  })
})

test.describe('Responsive layout (375x812)', { tag: '@responsive' }, () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('TC-37 mobile viewport has no page-level horizontal scroll and stacks the KPI cards', async ({ dashboard }) => {
    await expect(dashboard.heading).toBeVisible()
    await expect(dashboard.searchInput).toBeVisible()
    await expect(dashboard.metricCards).toHaveCount(4)

    // The page itself must not scroll sideways...
    const pageOverflow = await dashboard.page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(pageOverflow).toBeLessThanOrEqual(0)

    // ...the wide table should scroll inside its own wrapper instead.
    const tableScrolls = await dashboard.tableWrap.evaluate((el) => el.scrollWidth > el.clientWidth)
    expect(tableScrolls).toBe(true)

    // Below 720px the KPI grid collapses to a single column.
    const first = await dashboard.metricCards.nth(0).boundingBox()
    const second = await dashboard.metricCards.nth(1).boundingBox()
    expect(first && second && first.x === second.x && second.y > first.y).toBe(true)
  })
})

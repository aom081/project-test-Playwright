import type { Locator, Page } from '@playwright/test'
import type { SegmentLabel } from '../support/data'

/** Page Object for the Operations Dashboard (src/dashboard/Dashboard.tsx). */
export class DashboardPage {
  readonly heading: Locator
  readonly main: Locator
  readonly searchInput: Locator
  readonly rows: Locator
  readonly visibleBadge: Locator
  readonly windowBadge: Locator
  readonly bars: Locator
  readonly barValues: Locator
  readonly barFills: Locator
  readonly metricCards: Locator
  readonly inspectorCustomer: Locator
  readonly inspectorOrderId: Locator
  readonly inspectorSegmentBadge: Locator
  readonly inspectorDetails: Locator
  readonly reviewNote: Locator
  readonly compactToggle: Locator
  readonly exportButton: Locator
  readonly tableWrap: Locator

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 })
    this.main = page.locator('main')
    this.searchInput = page.getByLabel('Search orders')
    this.rows = page.locator('tbody tr')
    this.visibleBadge = page.locator('.panel-table .subtle-badge')
    this.windowBadge = page.locator('.panel-chart .subtle-badge')
    this.bars = page.locator('.bar-chart .bar-column')
    this.barValues = page.locator('.bar-chart .bar-value')
    this.barFills = page.locator('.bar-chart .bar-meter span')
    this.metricCards = page.locator('.metric-card')
    this.inspectorCustomer = page.locator('.panel-inspector .inspector-card strong')
    this.inspectorOrderId = page.locator('.panel-inspector .inspector-card p')
    this.inspectorSegmentBadge = page.locator('.panel-inspector .panel-heading .subtle-badge')
    this.inspectorDetails = page.locator('.panel-inspector .inspector-card dd')
    this.reviewNote = page.locator('.review-note')
    this.compactToggle = page.getByRole('button', { name: /^(Compact|Expanded) view$/ })
    this.exportButton = page.getByRole('button', { name: 'Export snapshot' })
    this.tableWrap = page.locator('.table-wrap')
  }

  async goto() {
    await this.page.goto('/')
  }

  rangeTab(label: string): Locator {
    return this.page.getByRole('tab', { name: label, exact: true })
  }

  segmentChip(label: SegmentLabel): Locator {
    return this.page.getByRole('button', { name: label, exact: true })
  }

  orderButton(id: string): Locator {
    return this.page.getByRole('button', { name: id, exact: true })
  }

  row(id: string): Locator {
    return this.rows.filter({ hasText: id })
  }

  actionButton(name: 'Approve' | 'Flag review' | 'Refund'): Locator {
    return this.page.getByRole('button', { name, exact: true })
  }

  async selectRange(label: string) {
    await this.rangeTab(label).click()
  }

  async selectSegment(label: SegmentLabel) {
    await this.segmentChip(label).click()
  }

  async search(query: string) {
    await this.searchInput.fill(query)
  }

  async selectOrder(id: string) {
    await this.orderButton(id).click()
  }
}

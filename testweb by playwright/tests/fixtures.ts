import { test as base } from '@playwright/test'
import { DashboardPage } from './pages/DashboardPage'

type Fixtures = {
  /** A DashboardPage that has already navigated to "/". */
  dashboard: DashboardPage
}

export const test = base.extend<Fixtures>({
  dashboard: async ({ page }, use) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto()
    await use(dashboard)
  },
})

export { expect } from '@playwright/test'

# Test Plan: Operations Dashboard (testweb-by-playwright)

| | |
|---|---|
| **Document ID** | SPRS-Test-Plan |
| **Version** | 2.0 (upgrade) |
| **Related documents** | `SPRS-E2E-BDD-UserStories.docx`, `SPRS-Test-Cases.docx` (TC-01 to TC-22) |
| **Scope of this revision** | Adds TC-23 to TC-37 and upgrades the automation framework |

## 1. Objective

Raise confidence in the dashboard's filtering, selection, charting and layout behaviour by (a) closing coverage gaps left by TC-01 to TC-22 and (b) making the suite maintainable, cross-browser and CI-ready.

## 2. Scope

**In scope:** date-range tabs and chart, segment filter, order search, order selection and inspector, review actions, compact view, keyboard operation, mobile layout, client-side runtime errors.

**Out of scope:** backend/API (all data is mock data embedded in `Dashboard.tsx`), visual-regression/pixel comparison, load and security testing.

**Known untested behaviour:** the "Export snapshot" button has no handler yet (see section 8).

## 3. Test approach

| Layer | Approach |
|---|---|
| Functional E2E | Playwright (`@playwright/test`) against the real rendered UI |
| Structure | Page Object (`tests/pages/DashboardPage.ts`), custom fixture (`tests/fixtures.ts`), shared expected data (`tests/support/data.ts`) |
| Data-driven | Parameterised loops for search terms, orders, and chart ranges (one test per data row, so failures point at the exact input) |
| Selection of tests | Tags: `@functional`, `@chart`, `@a11y`, `@responsive`, `@regression` (`npm run test:e2e:<area>`) |
| Cross-browser | Chromium, Firefox, WebKit |
| Diagnostics | Screenshot and video on failure, trace on first retry, HTML report, JUnit XML in CI |

### Framework upgrades delivered

1. `webServer` in `playwright.config.ts`: dev server starts automatically (previously the config pointed only at the Vercel URL and the README wrongly said a server was auto-started). `BASE_URL` still lets you target the deployed site.
2. Removed the deliberately failing test (`intentional failure to trigger screenshot`) and the hand-written `afterEach` screenshot hook. Built-in `screenshot: 'only-on-failure'` replaces it, so the suite is green when the app is healthy.
3. Page Object + fixture + data module, so locators and expected values live in one place.
4. Three browser projects, retries and workers tuned for CI, and a GitHub Actions workflow (`.github/workflows/e2e.yml`: lint, build, install browsers, test, upload report).

## 4. Environments

| Item | Value |
|---|---|
| Local | `npm run test:e2e` (Vite dev server on `http://127.0.0.1:4173`) |
| Deployed | `BASE_URL=https://project-test-playwright.vercel.app` |
| Browsers | Desktop Chrome, Desktop Firefox, Desktop Safari (WebKit) |
| Viewport | Desktop default; TC-37 overrides to 375x812 |
| Runtime | Node 22 |

## 5. Entry and exit criteria

**Entry:** `npm ci` succeeds, browsers installed (`npm run test:e2e:install`), app builds (`npm run build`).

**Exit:** 100% of High-priority cases pass on all three browsers; no open High/Critical defects; every failure triaged as defect, test issue, or accepted behaviour.

## 6. Test cases (TC-23 to TC-37)

Priority: H = High, M = Medium, L = Low. All are automated in `tests/dashboard-extended.spec.ts`. "Data rows" is the number of Playwright tests the case expands into.

| ID | Title | Story | Pri | Data rows | Tag |
|---|---|---|---|---|---|
| TC-23 | Trial segment shows only trial orders | US-03 | H | 1 | @functional |
| TC-24 | Default state selects the first order | US-01, US-05 | H | 1 | @functional |
| TC-25 | Only the active segment chip is highlighted | US-03 | M | 1 | @functional |
| TC-26 | Search matches across id, customer, status, owner | US-04 | H | 5 | @functional |
| TC-27 | Search ignores leading/trailing whitespace | US-04 | M | 1 | @functional |
| TC-28 | "visible" badge tracks every filter change | US-03, US-04 | M | 1 | @functional |
| TC-29 | Inspector keeps selection when the order is filtered out | US-05 | M | 1 | @functional |
| TC-30 | Clicking anywhere on a row selects it | US-05 | M | 1 | @functional |
| TC-31 | Inspector shows correct details for each order | US-05 | H | 5 | @functional |
| TC-32 | Chart bar values match the dataset per range | US-02 | H | 3 | @chart |
| TC-33 | Bars are scaled relative to the tallest bar | US-02 | M | 3 | @chart |
| TC-34 | Range, segment and search filters are independent | US-02, US-03, US-04 | H | 1 | @functional |
| TC-35 | Date range tabs work with the keyboard | US-02 (new: a11y) | M | 1 | @a11y |
| TC-36 | Full workflow raises no console or page errors | all (new: stability) | H | 1 | @regression |
| TC-37 | Mobile viewport: no page-level horizontal scroll, KPI cards stack | US-07 (new: responsive) | M | 1 | @responsive |

Totals: 15 test cases, 27 Playwright tests, 81 executions across 3 browsers. Priority split: 7 High, 8 Medium.

### Detailed specifications

**TC-23: Trial segment shows only trial orders.**
*Pre:* dashboard loaded, segment = All. *Steps:* 1) click segment "Trial". *Expected:* exactly 1 row (ORD-9818, Northwind); badge reads "1 visible".

**TC-24: Default state selects the first order.**
*Pre:* fresh page load. *Steps:* observe inspector, table, review note, range tabs. *Expected:* inspector shows Atlas Studio / ORD-9812 with segment badge "Enterprise"; that row has `is-selected`; review note is "All checks passed"; the "30 days" tab has `aria-selected="true"`.

**TC-25: Only the active segment chip is highlighted.**
*Steps:* click each segment in turn (All, Enterprise, SMB, Trial). *Expected:* after each click, that chip has `is-active` and the other three do not.

**TC-26: Search matches across fields** (data-driven).

| Query | Matches on | Expected rows |
|---|---|---|
| `paid` | status | ORD-9812, ORD-9820 |
| `maya` | owner | ORD-9812 |
| `9815` | partial order id | ORD-9815 |
| `refund` | status | ORD-9824 |
| `ORD-98` | shared id prefix | all 5, in original order |

*Steps:* type the query in "Search orders". *Expected:* exactly the listed rows, in that order.

**TC-27: Search ignores surrounding whitespace.**
*Steps:* type `   Lumen   `. *Expected:* 1 row, ORD-9815 (the app trims the query).

**TC-28: "visible" badge tracks every filter change.**
*Steps:* note badge (5) → Enterprise (2) → search `zzz-notfound` (0) → clear search and choose All (5). *Expected:* badge reads "5 visible", "2 visible", "0 visible", "5 visible" respectively.

**TC-29: Inspector keeps selection when filtered out.**
*Pre:* default selection ORD-9812 (Enterprise). *Steps:* click segment "SMB". *Expected:* table shows 2 rows without ORD-9812, while the inspector still shows Atlas Studio with badge "Enterprise". *Note:* this documents current behaviour; if product decides selection should clear or move, update this case.

**TC-30: Clicking anywhere on a row selects it.**
*Steps:* click the Customer cell of ORD-9820 (not the id button). *Expected:* row gets `is-selected`; inspector shows Aster Health.

**TC-31: Inspector details per order** (data-driven over all 5 orders).
*Steps:* click each order id. *Expected:* customer name, order id, segment badge, and the Status/Owner/Amount values match the mock record (for example ORD-9820: Aster Health, Enterprise, Paid, Liam, $6,500).

**TC-32: Bar values match the dataset** (7, 30, 90 days).
*Steps:* select the range. *Expected:* the numeric labels under the bars equal the dataset exactly and in order (7d: 42, 55, 38, 68, 74, 61, 88; and so on).

**TC-33: Bars scaled to the tallest bar** (7, 30, 90 days).
*Expected:* each bar height is `max(18, round(value / max * 100))%`; the tallest bar is exactly 100%.

**TC-34: Filters are independent.**
*Steps:* choose SMB, search `Lumen` (1 row), then switch range to "90 days". *Expected:* window badge changes to "Window: 90 days" while the row count (1), search text ("Lumen"), and SMB highlight are unchanged.

**TC-35: Keyboard operation.**
*Steps:* focus "7 days" and press Enter; focus "90 days" and press Space; press Tab from "90 days". *Expected:* each key activates the tab (`aria-selected` moves, window badge updates); Tab moves focus to the search field.

**TC-36: No runtime errors.**
*Steps:* with listeners attached before load, cycle all ranges and segments, search, select an order, press Approve / Flag review / Refund, toggle compact view. *Expected:* zero `pageerror` events and zero `console.error` messages.

**TC-37: Mobile layout** (375x812).
*Expected:* page does not scroll horizontally; the table scrolls inside `.table-wrap`; the four KPI cards stack in a single column; heading and search field are visible.

## 7. Traceability

| User story | Existing TCs | New TCs |
|---|---|---|
| US-01 Overview | TC-01, 02 | TC-24 |
| US-02 Date range | TC-03, 04 | TC-32, 33, 34, 35 |
| US-03 Segment filter | TC-05, 06, 07 | TC-23, 25, 28, 34 |
| US-04 Search | TC-08, 09, 10, 11 | TC-26, 27, 28, 34 |
| US-05 Inspector | TC-12, 13 | TC-24, 29, 30, 31 |
| US-06 Actions | TC-14, 15, 16, 17 | TC-36 |
| US-07 Layout | TC-18, 19 | TC-37 |
| US-08 KPI / feed | TC-20, 21 | none |
| Proposed US-09 Accessibility | none | TC-35 |
| Proposed US-10 Runtime stability | none | TC-36 |

## 8. Risks and findings from code review

| # | Observation | Impact | Suggested handling |
|---|---|---|---|
| 1 | **Review note is not reset when the selected order changes.** Approve ORD-9812, then select ORD-9815: the note still says "Approved applied to ORD-9812" next to a different order. | Possible UX defect (stale status). | Confirm intended behaviour with the product owner; then add a test either way. Not included in the 15 because the expected result is undecided. |
| 2 | **"Export snapshot" has no click handler.** | Button appears functional but does nothing. | Add a case once the feature exists. |
| 3 | **Selected order can be absent from the filtered table** (TC-29). | Inspector can describe an order the user cannot see. | Confirm intent; TC-29 pins current behaviour. |
| 4 | **TC-37 may fail.** The table has `min-width: 720px` inside grid cells that may not shrink; this can cause page-level horizontal scroll at 375px. This was reasoned from the CSS, not observed. | If it fails, it is a genuine layout defect, not a test bug. | Run once and inspect the failure screenshot. |
| 5 | Row `onClick` and the inner button's `onClick` both set the selection (redundant, harmless). | None today. | Covered implicitly by TC-30. |
| 6 | Existing specs use CSS-class locators (`.review-note`, `.panel-inspector ...`) that break on restyling. | Maintenance cost. | Prefer adding `data-testid` attributes in the app; the Page Object means only one file changes. |

## 9. How to run

```bash
npm ci
npm run test:e2e:install      # first time only
npm run test:e2e              # all browsers; dev server starts automatically
npm run test:e2e:chromium     # quick run
npm run test:e2e:report       # open the HTML report
```

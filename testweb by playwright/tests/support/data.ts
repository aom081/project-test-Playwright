/**
 * Expected mock data, mirrored from src/dashboard/Dashboard.tsx.
 * Tests assert against this single source of truth instead of scattering literals.
 * If the mock data in the app changes, update it here.
 */

export type RangeKey = '7d' | '30d' | '90d'
export type SegmentLabel = 'All' | 'Enterprise' | 'SMB' | 'Trial'

export const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
]

export const segments: SegmentLabel[] = ['All', 'Enterprise', 'SMB', 'Trial']

export const chartData: Record<RangeKey, number[]> = {
  '7d': [42, 55, 38, 68, 74, 61, 88],
  '30d': [36, 49, 44, 57, 63, 58, 71, 69, 75, 80],
  '90d': [28, 34, 31, 42, 46, 50, 54, 61, 65, 70, 78, 84],
}

export interface Order {
  id: string
  customer: string
  segment: Exclude<SegmentLabel, 'All'>
  status: string
  amount: string
  owner: string
}

export const orders: Order[] = [
  { id: 'ORD-9812', customer: 'Atlas Studio', segment: 'Enterprise', status: 'Paid', amount: '$4,250', owner: 'Maya' },
  { id: 'ORD-9815', customer: 'Lumen Labs', segment: 'SMB', status: 'Pending', amount: '$1,840', owner: 'Noah' },
  { id: 'ORD-9818', customer: 'Northwind', segment: 'Trial', status: 'Review', amount: '$620', owner: 'Ava' },
  { id: 'ORD-9820', customer: 'Aster Health', segment: 'Enterprise', status: 'Paid', amount: '$6,500', owner: 'Liam' },
  { id: 'ORD-9824', customer: 'Orbital One', segment: 'SMB', status: 'Refund', amount: '$780', owner: 'Zoe' },
]

export const DEFAULT_REVIEW_NOTE = 'All checks passed'

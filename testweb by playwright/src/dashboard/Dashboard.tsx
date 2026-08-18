import { useState } from 'react'
import './Dashboard.css'

type RangeKey = '7d' | '30d' | '90d'
type SegmentKey = 'All' | 'Enterprise' | 'SMB' | 'Trial'

const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
]

const segments: SegmentKey[] = ['All', 'Enterprise', 'SMB', 'Trial']

const metrics = [
  { label: 'Monthly revenue', value: '$128.4k', delta: '+12.6%' },
  { label: 'Active users', value: '18,294', delta: '+4.1%' },
  { label: 'Avg. response', value: '240 ms', delta: '-18 ms' },
  { label: 'Open incidents', value: '3', delta: '-2' },
]

const chartData: Record<RangeKey, number[]> = {
  '7d': [42, 55, 38, 68, 74, 61, 88],
  '30d': [36, 49, 44, 57, 63, 58, 71, 69, 75, 80],
  '90d': [28, 34, 31, 42, 46, 50, 54, 61, 65, 70, 78, 84],
}

const activity = [
  { time: '08:12', title: 'North America sync completed', detail: '12 workspaces synced without drift.' },
  { time: '08:47', title: 'Billing spike detected', detail: 'Traffic peaked at 143% of baseline for 8 minutes.' },
  { time: '09:04', title: 'Incident 204 resolved', detail: 'Cache rollout restored latency to target.' },
  { time: '09:31', title: 'New dashboard published', detail: 'Operations team shipped the Q3 executive view.' },
]

const orders = [
  { id: 'ORD-9812', customer: 'Atlas Studio', segment: 'Enterprise', status: 'Paid', amount: '$4,250', owner: 'Maya' },
  { id: 'ORD-9815', customer: 'Lumen Labs', segment: 'SMB', status: 'Pending', amount: '$1,840', owner: 'Noah' },
  { id: 'ORD-9818', customer: 'Northwind', segment: 'Trial', status: 'Review', amount: '$620', owner: 'Ava' },
  { id: 'ORD-9820', customer: 'Aster Health', segment: 'Enterprise', status: 'Paid', amount: '$6,500', owner: 'Liam' },
  { id: 'ORD-9824', customer: 'Orbital One', segment: 'SMB', status: 'Refund', amount: '$780', owner: 'Zoe' },
]

function Dashboard() {
  const [range, setRange] = useState<RangeKey>('30d')
  const [segment, setSegment] = useState<SegmentKey>('All')
  const [query, setQuery] = useState('')
  const [compactMode, setCompactMode] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0].id)
  const [reviewNote, setReviewNote] = useState('All checks passed')

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0]

  const filteredOrders = orders.filter((order) => {
    const matchesSegment = segment === 'All' || order.segment === segment
    const matchesQuery =
      query.trim().length === 0 ||
      [order.id, order.customer, order.status, order.owner]
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase())

    return matchesSegment && matchesQuery
  })

  const chartValues = chartData[range]
  const maxValue = Math.max(...chartValues)

  const handleStatusAction = (label: string) => {
    setReviewNote(`${label} applied to ${selectedOrder.id}`)
  }

  return (
    <main className={`dashboard-shell ${compactMode ? 'compact' : ''}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Operations dashboard</p>
          <h1>Command center for product, revenue, and support</h1>
          <p className="lede">
            A realistic testing surface with filters, summaries, a live activity feed, and a table that reacts to user input.
          </p>
        </div>

        <div className="topbar-actions">
          <span className="status-pill">Live sync on</span>
          <button type="button" className="ghost-button" onClick={() => setCompactMode((value) => !value)}>
            {compactMode ? 'Expanded view' : 'Compact view'}
          </button>
          <button type="button" className="primary-button">
            Export snapshot
          </button>
        </div>
      </header>

      <section className="control-panel" aria-label="Dashboard controls">
        <div className="button-group" role="tablist" aria-label="Date range">
          {ranges.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={range === item.key}
              className={range === item.key ? 'chip is-active' : 'chip'}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="field-group">
          <label htmlFor="order-search">Search orders</label>
          <input
            id="order-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Customer, order id, or owner"
          />
        </div>

        <div className="button-group" aria-label="Segments">
          {segments.map((item) => (
            <button
              key={item}
              type="button"
              className={segment === item ? 'chip is-active' : 'chip'}
              onClick={() => setSegment(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="metrics-grid" aria-label="Key performance indicators">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.delta}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel panel-chart">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Revenue pulse</p>
              <h2>Daily performance trend</h2>
            </div>
            <span className="subtle-badge">Window: {ranges.find((item) => item.key === range)?.label}</span>
          </div>

          <div className="bar-chart" aria-label="Revenue bar chart">
            {chartValues.map((value, index) => {
              const height = Math.max(18, Math.round((value / maxValue) * 100))

              return (
                <div className="bar-column" key={`${range}-${index}`}>
                  <div className="bar-meter">
                    <span style={{ height: `${height}%` }} />
                  </div>
                  <span className="bar-value">{value}</span>
                </div>
              )
            })}
          </div>

          <div className="panel-footer">
            <span>Conversion up 8.2% vs previous window</span>
            <span>Forecast confidence 94%</span>
          </div>
        </article>

        <article className="panel panel-activity">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Live activity</p>
              <h2>Event stream</h2>
            </div>
            <span className="subtle-badge">{activity.length} entries</span>
          </div>

          <ul className="activity-list">
            {activity.map((item) => (
              <li key={item.time + item.title}>
                <span className="activity-time">{item.time}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel panel-inspector">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Inspector</p>
              <h2>Selected order</h2>
            </div>
            <span className="subtle-badge">{selectedOrder.segment}</span>
          </div>

          <div className="inspector-card">
            <div>
              <strong>{selectedOrder.customer}</strong>
              <p>{selectedOrder.id}</p>
            </div>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>{selectedOrder.status}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{selectedOrder.owner}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{selectedOrder.amount}</dd>
              </div>
            </dl>
          </div>

          <div className="action-stack" role="group" aria-label="Order actions">
            <button type="button" className="secondary-button" onClick={() => handleStatusAction('Approved')}>
              Approve
            </button>
            <button type="button" className="secondary-button" onClick={() => handleStatusAction('Flagged for review')}>
              Flag review
            </button>
            <button type="button" className="secondary-button" onClick={() => handleStatusAction('Refund queued')}>
              Refund
            </button>
          </div>

          <p className="review-note">{reviewNote}</p>
        </article>

        <article className="panel panel-table">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Order queue</p>
              <h2>Recent transactions</h2>
            </div>
            <span className="subtle-badge">{filteredOrders.length} visible</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Segment</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={selectedOrderId === order.id ? 'is-selected' : ''}
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <td>
                      <button type="button" className="row-button" onClick={() => setSelectedOrderId(order.id)}>
                        {order.id}
                      </button>
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.segment}</td>
                    <td>
                      <span className={`status-chip status-${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td>{order.owner}</td>
                    <td>{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Dashboard
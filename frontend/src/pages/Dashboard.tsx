import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppShell } from '../components/layout/AppShell'
import { Badge, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '../components/ui'
import { useDashboardSummary } from '../hooks/useDashboard'
import { formatCurrency, formatOrderId } from '../lib/format'
import { formatPageTitle } from '../lib/utils'

type StatTileProps = {
  accent?: 'tertiary'
  label: string
  value: number
}

function StatTile({ accent, label, value }: StatTileProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-outline-variant bg-surface-container-low p-4',
        accent === 'tertiary' && 'border-l-2 border-l-tertiary',
      )}
    >
      <p className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant">
        {label}
      </p>
      <p className="mt-3 font-mono text-display-sm text-on-surface">{value}</p>
    </div>
  )
}

function StatTileSkeleton({ accent }: { accent?: 'tertiary' }) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-outline-variant bg-surface-container-low p-4',
        accent === 'tertiary' && 'border-l-2 border-l-tertiary',
      )}
    >
      <div className="h-4 w-24 animate-pulse rounded bg-surface-container-high" />
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-surface-container-high" />
    </div>
  )
}

function SectionCard({
  title,
  to,
  children,
}: {
  children: React.ReactNode
  title: string
  to: string
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
      <header className="flex items-center justify-between gap-4 border-b border-outline-variant/40 px-4 py-3">
        <h2 className="font-display text-headline-sm text-on-surface">{title}</h2>
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 font-body text-body-sm text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <span>View All</span>
          <ArrowRight size={14} strokeWidth={1.8} />
        </Link>
      </header>
      <div className="min-w-0 p-4">{children}</div>
    </section>
  )
}

export function DashboardPage() {
  document.title = formatPageTitle('Dashboard')

  const { data, isLoading } = useDashboardSummary()

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <>
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton />
              <StatTileSkeleton accent="tertiary" />
            </>
          ) : (
            <>
              <StatTile label="Total Products" value={data?.total_products ?? 0} />
              <StatTile label="Total Customers" value={data?.total_customers ?? 0} />
              <StatTile label="Total Orders" value={data?.total_orders ?? 0} />
              <StatTile
                accent="tertiary"
                label="Low Stock Items"
                value={data?.low_stock_count ?? 0}
              />
            </>
          )}
        </section>

        <section className="grid min-w-0 gap-6 xl:grid-cols-2">
          <SectionCard title="Low Stock Products" to="/products">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-9 animate-pulse rounded bg-surface-container-high" />
                ))}
              </div>
            ) : data && data.low_stock_products.length > 0 ? (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Product Name</TableHeaderCell>
                    <TableHeaderCell>SKU</TableHeaderCell>
                    <TableHeaderCell>Qty</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {data.low_stock_products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell mono>{product.sku}</TableCell>
                      <TableCell mono className="text-tertiary">
                        {product.quantity_in_stock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="font-body text-body-md text-on-surface-variant">No low stock items</p>
            )}
          </SectionCard>

          <SectionCard title="Recent Orders" to="/orders">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="h-9 animate-pulse rounded bg-surface-container-high" />
                ))}
              </div>
            ) : data && data.recent_orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Order ID</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Total</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {data.recent_orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell mono>{formatOrderId(order.id)}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge
                          status={order.status === 'cancelled' ? 'cancelled' : 'active'}
                        />
                      </TableCell>
                      <TableCell mono>{formatCurrency(order.total_amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="font-body text-body-md text-on-surface-variant">No recent orders</p>
            )}
          </SectionCard>
        </section>
      </div>
    </AppShell>
  )
}

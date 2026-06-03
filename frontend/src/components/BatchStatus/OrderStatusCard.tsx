import { useState } from 'react'
import type { OrderOutput } from '../../types/api'
import { Badge } from '../ui/Badge'

interface OrderStatusCardProps {
  order: OrderOutput
  index: number
}

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'

export function OrderStatusCard({ order, index }: OrderStatusCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
          {index + 1}
        </span>

        <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{order.customerName}</p>
            <p className="text-xs text-slate-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">{fmt.format(order.totalAmount)}</span>
            <Badge status={order.status} />
          </div>
        </div>

        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {expanded && (
        <div className="animate-slide-down border-t border-slate-100 px-4 pb-4 pt-3">
          {order.errorMessage && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {order.errorMessage}
            </div>
          )}

          {order.processedAt && (
            <p className="mb-3 text-xs text-slate-500">
              Processed at {fmtDate(order.processedAt)}
            </p>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Unit</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 text-slate-700">{item.productName}</td>
                  <td className="py-2 text-right text-slate-500">{item.quantity}</td>
                  <td className="py-2 text-right text-slate-500">{fmt.format(item.unitPrice)}</td>
                  <td className="py-2 text-right font-medium text-slate-700">{fmt.format(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200">
                <td colSpan={3} className="pt-2 text-right text-xs font-medium text-slate-500">Total</td>
                <td className="pt-2 text-right font-semibold text-indigo-600">{fmt.format(order.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}

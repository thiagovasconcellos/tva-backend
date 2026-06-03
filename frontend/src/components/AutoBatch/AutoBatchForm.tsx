import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { processBatch } from '../../api/client'
import type { ProcessBatchOutput } from '../../types/api'
import { generateRandomOrders, type GeneratedOrder } from '../../data/randomData'
import { Button } from '../ui/Button'

const PRESETS = [5, 10, 25, 50, 100, 200]
const PREVIEW_LIMIT = 8
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

interface AutoBatchFormProps {
  onSuccess?: (result: ProcessBatchOutput) => void
}

export function AutoBatchForm({ onSuccess }: AutoBatchFormProps) {
  const [count, setCount] = useState(20)
  const [orders, setOrders] = useState<GeneratedOrder[]>(() => generateRandomOrders(20))
  const [result, setResult] = useState<ProcessBatchOutput | null>(null)
  const [copied, setCopied] = useState(false)

  const mutation = useMutation({
    mutationFn: processBatch,
    onSuccess: (data) => {
      setResult(data)
      onSuccess?.(data)
    },
  })

  const regenerate = useCallback((newCount: number) => {
    setOrders(generateRandomOrders(newCount))
  }, [])

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    setCount(val)
    regenerate(val)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1))
    setCount(val)
    regenerate(val)
  }

  const handlePreset = (val: number) => {
    setCount(val)
    regenerate(val)
  }

  const handleSubmit = () => {
    mutation.mutate({
      orders: orders.map((o) => ({
        customerName: o.customerName,
        items: o.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      })),
    })
  }

  const copyId = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.batchJobId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const reset = () => {
    setResult(null)
    mutation.reset()
    regenerate(count)
  }

  const totalItems = orders.reduce((s, o) => s + o.items.length, 0)
  const estimatedTotal = orders.reduce((s, o) => s + o.estimatedTotal, 0)
  const avgItems = orders.length > 0 ? (totalItems / orders.length).toFixed(1) : '0'

  const preview = orders.slice(0, PREVIEW_LIMIT)
  const remaining = orders.length - preview.length

  if (result) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className={`rounded-xl border p-5 ${result.failedOrders === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-1.5 ${result.failedOrders === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {result.failedOrders === 0 ? (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${result.failedOrders === 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                Batch submitted successfully
              </p>
              <p className={`mt-0.5 text-sm ${result.failedOrders === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {result.completedOrders} completed · {result.failedOrders} failed · {result.totalOrders} total
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <p className="mb-1 text-xs font-medium text-slate-500">Batch ID</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-hidden text-ellipsis font-mono text-sm text-slate-700">
                {result.batchJobId}
              </code>
              <Button variant="secondary" size="sm" type="button" onClick={copyId}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={reset}>
            Generate another batch
          </Button>
          <Button type="button" onClick={() => onSuccess?.(result)}>
            View status →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {mutation.isError && (
        <div className="animate-fade-in rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : 'An unexpected error occurred.'}
        </div>
      )}

      {/* Count selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">Number of orders</label>
          <input
            type="number"
            min={1}
            max={200}
            value={count}
            onChange={handleInput}
            className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-center text-sm font-bold text-indigo-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {/* Slider */}
        <div className="mb-4">
          <input
            type="range"
            min={1}
            max={200}
            value={count}
            onChange={handleSlider}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-indigo-600"
          />
          <div className="mt-1 flex justify-between text-xs text-slate-400">
            <span>1</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-xs font-medium text-slate-500">Quick:</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePreset(p)}
              className={[
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                count === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Orders" value={count} color="indigo" />
        <StatCard label="Total items" value={totalItems} sub={`~${avgItems} per order`} color="violet" />
        <StatCard label="Est. total" value={fmt.format(estimatedTotal)} color="emerald" />
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">
            Preview
            <span className="ml-2 text-xs font-normal text-slate-400">
              (showing {preview.length} of {orders.length})
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => regenerate(count)}
            disabled={mutation.isPending}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            Regenerate
          </Button>
        </div>

        <div className="divide-y divide-slate-50">
          {preview.map((order, i) => (
            <PreviewRow key={i} order={order} index={i} />
          ))}
          {remaining > 0 && (
            <div className="px-4 py-2.5 text-center text-xs text-slate-400">
              + {remaining} more order{remaining !== 1 ? 's' : ''} not shown
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button size="lg" loading={mutation.isPending} onClick={handleSubmit}>
          {mutation.isPending
            ? `Processing ${count} orders…`
            : `Submit ${count} random order${count !== 1 ? 's' : ''} →`}
        </Button>
      </div>
    </div>
  )
}

function PreviewRow({ order, index }: { order: GeneratedOrder; index: number }) {
  const itemLabel = order.items.length === 1
    ? order.items[0].productName
    : `${order.items[0].productName} +${order.items.length - 1} more`

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
        {index + 1}
      </span>
      <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">{order.customerName}</p>
          <p className="truncate text-xs text-slate-400">{itemLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-right">
          <span className="text-xs text-slate-400">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-semibold tabular-nums text-slate-600">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.estimatedTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string | number
  sub?: string
  color: 'indigo' | 'violet' | 'emerald'
}) {
  const colors = {
    indigo:  'bg-indigo-50  text-indigo-700  ring-indigo-100',
    violet:  'bg-violet-50  text-violet-700  ring-violet-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  }
  return (
    <div className={`rounded-xl p-4 ring-1 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-75">{label}</p>
      <p className="mt-1 truncate text-xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
    </div>
  )
}

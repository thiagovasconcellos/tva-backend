import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBatchJob } from '../../api/client'
import { ApiError } from '../../api/client'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { OrderStatusCard } from './OrderStatusCard'

interface BatchStatusViewProps {
  initialBatchJobId?: string
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' })

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-500 tabular-nums">{value}/{total}</span>
    </div>
  )
}

export function BatchStatusView({ initialBatchJobId = '' }: BatchStatusViewProps) {
  const [inputId, setInputId] = useState(initialBatchJobId)
  const [searchId, setSearchId] = useState(initialBatchJobId)

  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['batch', searchId],
    queryFn: () => getBatchJob(searchId),
    enabled: searchId.trim().length > 0,
    staleTime: 10_000,
    retry: false,
  })

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    setSearchId(inputId.trim())
  }

  const isNotFound = isError && error instanceof ApiError && error.status === 404

  return (
    <div className="space-y-5">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={inputId}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInputId(e.target.value)}
          placeholder="Paste a Batch ID here…"
          className="flex-1 font-mono text-xs"
          aria-label="Batch ID"
        />
        <Button type="submit" loading={isFetching} disabled={!inputId.trim()}>
          Search
        </Button>
        {data && (
          <Button type="button" variant="secondary" onClick={() => refetch()} loading={isFetching}>
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
            </svg>
            Refresh
          </Button>
        )}
      </form>

      {isNotFound && (
        <div className="animate-fade-in rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">Batch job not found</p>
          <p className="mt-1 text-xs text-slate-400">Check the ID and try again.</p>
        </div>
      )}

      {isError && !isNotFound && (
        <div className="animate-fade-in rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load batch job.'}
        </div>
      )}

      {!searchId && !data && (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-10 text-center">
          <svg className="mx-auto h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <p className="mt-3 text-sm text-slate-500">Enter a Batch ID to view its status</p>
        </div>
      )}

      {data && (
        <div className="animate-fade-in space-y-5">
          {/* Summary card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-800">Batch Job</h2>
                  <Badge status={data.status} />
                </div>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{data.batchJobId}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>Created: {fmtDate(data.createdAt)}</p>
                {data.completedAt && <p>Completed: {fmtDate(data.completedAt)}</p>}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-lg border border-slate-100 bg-slate-50">
              <div className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{data.totalOrders}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{data.completedOrders}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className={`text-2xl font-bold ${data.failedOrders > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                  {data.failedOrders}
                </p>
                <p className="text-xs text-slate-500">Failed</p>
              </div>
            </div>

            <div className="mt-3">
              <ProgressBar value={data.completedOrders + data.failedOrders} total={data.totalOrders} />
            </div>
          </div>

          {/* Orders */}
          {data.orders.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-600">
                Orders ({data.orders.length})
              </h3>
              <div className="space-y-2">
                {data.orders.map((order, i) => (
                  <OrderStatusCard key={order.id} order={order} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

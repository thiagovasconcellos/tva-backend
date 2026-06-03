import type { BatchJobStatus, OrderStatus } from '../../types/api'

type Status = OrderStatus | BatchJobStatus

const statusConfig: Record<string, { label: string; className: string }> = {
  Pending:            { label: 'Pending',             className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  Processing:         { label: 'Processing',          className: 'bg-blue-50 text-blue-700 ring-blue-200 animate-pulse' },
  Completed:          { label: 'Completed',           className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Failed:             { label: 'Failed',              className: 'bg-red-50 text-red-700 ring-red-200' },
  Queued:             { label: 'Queued',              className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  PartiallyCompleted: { label: 'Partial',             className: 'bg-amber-50 text-amber-700 ring-amber-200' },
}

interface BadgeProps {
  status: Status
}

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 ring-slate-200' }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.className}`}>
      {config.label}
    </span>
  )
}

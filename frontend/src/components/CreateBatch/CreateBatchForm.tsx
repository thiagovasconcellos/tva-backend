import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { processBatch } from '../../api/client'
import type { ProcessBatchOutput } from '../../types/api'
import { Button } from '../ui/Button'
import { OrderCard, emptyItem, type OrderDraft, type OrderErrors } from './OrderCard'

function emptyOrder(): OrderDraft {
  return { customerName: '', items: [emptyItem()] }
}

type AllErrors = OrderErrors[]

function validate(orders: OrderDraft[]): AllErrors | null {
  let hasError = false
  const errors: AllErrors = orders.map((order) => {
    const orderErrors: OrderErrors = {}

    if (!order.customerName.trim()) {
      orderErrors.customerName = 'Customer name is required'
      hasError = true
    }

    orderErrors.items = order.items.map((item) => {
      const itemErrors: NonNullable<OrderErrors['items']>[number] = {}
      if (!item.productName.trim()) { itemErrors.productName = 'Required'; hasError = true }
      const qty = parseInt(item.quantity, 10)
      if (!item.quantity || isNaN(qty) || qty < 1) { itemErrors.quantity = '≥ 1'; hasError = true }
      const price = parseFloat(item.unitPrice)
      if (!item.unitPrice || isNaN(price) || price <= 0) { itemErrors.unitPrice = '> 0'; hasError = true }
      return itemErrors
    })

    return orderErrors
  })

  return hasError ? errors : null
}

interface CreateBatchFormProps {
  onSuccess?: (result: ProcessBatchOutput) => void
}

export function CreateBatchForm({ onSuccess }: CreateBatchFormProps) {
  const [orders, setOrders] = useState<OrderDraft[]>([emptyOrder()])
  const [errors, setErrors] = useState<AllErrors>([])
  const [result, setResult] = useState<ProcessBatchOutput | null>(null)
  const [copied, setCopied] = useState(false)

  const mutation = useMutation({
    mutationFn: processBatch,
    onSuccess: (data) => {
      setResult(data)
      onSuccess?.(data)
    },
  })

  const updateOrder = (index: number, update: Partial<OrderDraft>) => {
    setOrders((prev) => prev.map((o, i) => (i === index ? { ...o, ...update } : o)))
    setErrors((prev) => prev.map((e, i) => (i === index ? {} : e)))
  }

  const removeOrder = (index: number) => {
    setOrders((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => prev.filter((_, i) => i !== index))
  }

  const addOrder = () => {
    setOrders((prev) => [...prev, emptyOrder()])
    setErrors((prev) => [...prev, {}])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate(orders)
    if (validationErrors) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    mutation.mutate({
      orders: orders.map((o) => ({
        customerName: o.customerName,
        items: o.items.map((it) => ({
          productName: it.productName,
          quantity: parseInt(it.quantity, 10),
          unitPrice: parseFloat(it.unitPrice),
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
    setOrders([emptyOrder()])
    setErrors([])
    setResult(null)
    mutation.reset()
  }

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
              <code className="flex-1 overflow-hidden text-ellipsis text-sm font-mono text-slate-700">
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
            Create another batch
          </Button>
          <Button type="button" onClick={() => onSuccess?.(result)}>
            View status →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mutation.isError && (
        <div className="animate-fade-in rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : 'An unexpected error occurred.'}
        </div>
      )}

      {orders.map((order, index) => (
        <OrderCard
          key={index}
          order={order}
          index={index}
          showRemove={orders.length > 1}
          errors={errors[index]}
          onChange={updateOrder}
          onRemove={removeOrder}
        />
      ))}

      <div className="flex items-center justify-between pt-1">
        <Button variant="secondary" type="button" onClick={addOrder}>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Add order
        </Button>

        <Button type="submit" size="lg" loading={mutation.isPending}>
          {mutation.isPending ? 'Processing…' : `Submit batch (${orders.length} order${orders.length !== 1 ? 's' : ''})`}
        </Button>
      </div>
    </form>
  )
}

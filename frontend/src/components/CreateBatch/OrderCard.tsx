import type { ChangeEvent } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { OrderItemRow, type ItemDraft } from './OrderItemRow'

export interface OrderDraft {
  customerName: string
  items: ItemDraft[]
}

export interface OrderErrors {
  customerName?: string
  items?: { productName?: string; quantity?: string; unitPrice?: string }[]
}

interface OrderCardProps {
  order: OrderDraft
  index: number
  showRemove: boolean
  errors?: OrderErrors
  onChange: (orderIndex: number, update: Partial<OrderDraft>) => void
  onRemove: (orderIndex: number) => void
}

function emptyItem(): ItemDraft {
  return { productName: '', quantity: '1', unitPrice: '' }
}

export function OrderCard({ order, index, showRemove, errors, onChange, onRemove }: OrderCardProps) {
  const updateItem = (itemIndex: number, field: keyof ItemDraft, value: string) => {
    const updated = order.items.map((it, i) => (i === itemIndex ? { ...it, [field]: value } : it))
    onChange(index, { items: updated })
  }

  const removeItem = (itemIndex: number) => {
    onChange(index, { items: order.items.filter((_, i) => i !== itemIndex) })
  }

  const addItem = () => {
    onChange(index, { items: [...order.items, emptyItem()] })
  }

  const subtotal = order.items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0
    const price = parseFloat(it.unitPrice) || 0
    return sum + qty * price
  }, 0)

  return (
    <div className="animate-slide-down rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-700">Order {index + 1}</span>
        <div className="flex items-center gap-3">
          {subtotal > 0 && (
            <span className="text-sm font-medium text-indigo-600">
              ${subtotal.toFixed(2)}
            </span>
          )}
          {showRemove && (
            <Button variant="ghost" size="sm" type="button" onClick={() => onRemove(index)}>
              Remove order
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <Input
          label="Customer name"
          placeholder="e.g. Alice Johnson"
          value={order.customerName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(index, { customerName: e.target.value })}
          error={errors?.customerName}
          aria-label="Customer name"
        />

        <div>
          <div className="mb-2 grid grid-cols-[1fr_80px_110px_32px] gap-2 px-0.5">
            <span className="text-xs font-medium text-slate-500">Product</span>
            <span className="text-xs font-medium text-slate-500">Qty</span>
            <span className="text-xs font-medium text-slate-500">Unit price</span>
            <span />
          </div>

          <div className="space-y-2">
            {order.items.map((item, itemIndex) => (
              <OrderItemRow
                key={itemIndex}
                item={item}
                index={itemIndex}
                showRemove={order.items.length > 1}
                errors={errors?.items?.[itemIndex]}
                onChange={updateItem}
                onRemove={removeItem}
              />
            ))}
          </div>

          <Button variant="ghost" size="sm" type="button" onClick={addItem} className="mt-2">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add item
          </Button>
        </div>
      </div>
    </div>
  )
}

export { emptyItem }

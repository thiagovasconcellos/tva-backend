import type { ChangeEvent } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export interface ItemDraft {
  productName: string
  quantity: string
  unitPrice: string
}

interface OrderItemRowProps {
  item: ItemDraft
  index: number
  showRemove: boolean
  errors?: { productName?: string; quantity?: string; unitPrice?: string }
  onChange: (index: number, field: keyof ItemDraft, value: string) => void
  onRemove: (index: number) => void
}

export function OrderItemRow({ item, index, showRemove, errors, onChange, onRemove }: OrderItemRowProps) {
  const handle = (field: keyof ItemDraft) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange(index, field, e.target.value)

  return (
    <div className="grid grid-cols-[1fr_80px_110px_32px] gap-2 items-start">
      <Input
        placeholder="Product name"
        value={item.productName}
        onChange={handle('productName')}
        error={errors?.productName}
        aria-label="Product name"
      />
      <Input
        placeholder="Qty"
        type="number"
        min={1}
        value={item.quantity}
        onChange={handle('quantity')}
        error={errors?.quantity}
        aria-label="Quantity"
      />
      <Input
        placeholder="Unit price"
        type="number"
        min={0.01}
        step={0.01}
        value={item.unitPrice}
        onChange={handle('unitPrice')}
        error={errors?.unitPrice}
        aria-label="Unit price"
      />
      <div className="pt-1">
        {showRemove && (
          <Button variant="ghost" size="sm" onClick={() => onRemove(index)} aria-label="Remove item" type="button" className="!px-1.5">
            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  )
}

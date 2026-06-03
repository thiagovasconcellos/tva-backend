export interface OrderItemInput {
  productName: string
  quantity: number
  unitPrice: number
}

export interface OrderInput {
  customerName: string
  items: OrderItemInput[]
}

export interface ProcessBatchRequest {
  orders: OrderInput[]
}

export interface ProcessBatchOutput {
  batchJobId: string
  totalOrders: number
  completedOrders: number
  failedOrders: number
  status: string
}

export interface OrderItemOutput {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderOutput {
  id: string
  customerName: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  processedAt: string | null
  errorMessage: string | null
  items: OrderItemOutput[]
}

export interface GetBatchOutput {
  batchJobId: string
  status: BatchJobStatus
  createdAt: string
  completedAt: string | null
  totalOrders: number
  completedOrders: number
  failedOrders: number
  orders: OrderOutput[]
}

export type OrderStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed'
export type BatchJobStatus = 'Queued' | 'Processing' | 'Completed' | 'PartiallyCompleted'

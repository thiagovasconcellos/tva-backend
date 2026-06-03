import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processBatch, getBatchJob, ApiError } from './client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('processBatch', () => {
  it('sends POST to /api/batch-orders and returns output', async () => {
    const output = { batchJobId: 'abc', totalOrders: 1, completedOrders: 1, failedOrders: 0, status: 'Completed' }
    mockFetch.mockReturnValueOnce(jsonResponse(output))

    const result = await processBatch({ orders: [{ customerName: 'Alice', items: [{ productName: 'Keyboard', quantity: 1, unitPrice: 100 }] }] })

    expect(mockFetch).toHaveBeenCalledWith('/api/batch-orders', expect.objectContaining({ method: 'POST' }))
    expect(result.batchJobId).toBe('abc')
    expect(result.status).toBe('Completed')
  })

  it('throws ApiError on 400 with server body', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({ code: 'EMPTY_BATCH', message: 'At least one order is required.' }, 400))

    await expect(processBatch({ orders: [] })).rejects.toSatisfy((e: unknown) => {
      return e instanceof ApiError && e.code === 'EMPTY_BATCH' && e.status === 400
    })
  })
})

describe('getBatchJob', () => {
  it('fetches /api/batch-orders/:id and returns output', async () => {
    const output = { batchJobId: 'abc', status: 'Completed', totalOrders: 1, completedOrders: 1, failedOrders: 0, createdAt: '', completedAt: null, orders: [] }
    mockFetch.mockReturnValueOnce(jsonResponse(output))

    const result = await getBatchJob('abc')

    expect(mockFetch).toHaveBeenCalledWith('/api/batch-orders/abc')
    expect(result.status).toBe('Completed')
  })

  it('throws ApiError with ENTITY_NOT_FOUND on 404', async () => {
    mockFetch.mockReturnValueOnce(jsonResponse({ code: 'ENTITY_NOT_FOUND', message: 'Not found.' }, 404))

    await expect(getBatchJob('bad-id')).rejects.toSatisfy((e: unknown) => {
      return e instanceof ApiError && e.status === 404
    })
  })
})

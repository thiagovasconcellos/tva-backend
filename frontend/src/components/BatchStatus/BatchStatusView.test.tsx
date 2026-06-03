import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BatchStatusView } from './BatchStatusView'
import * as client from '../../api/client'
import type { GetBatchOutput } from '../../types/api'

// Preserve real ApiError so instanceof checks work inside the component
vi.mock('../../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/client')>()
  return { ...actual, getBatchJob: vi.fn() }
})

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.resetAllMocks()
})

const mockBatch: GetBatchOutput = {
  batchJobId: 'test-batch-id',
  status: 'Completed',
  createdAt: '2026-06-03T20:50:00Z',
  completedAt: '2026-06-03T20:50:01Z',
  totalOrders: 1,
  completedOrders: 1,
  failedOrders: 0,
  orders: [
    {
      id: 'order-1',
      customerName: 'Alice',
      status: 'Completed',
      totalAmount: 249.90,
      createdAt: '2026-06-03T20:50:00Z',
      processedAt: '2026-06-03T20:50:01Z',
      errorMessage: null,
      items: [{ id: 'item-1', productName: 'Keyboard', quantity: 1, unitPrice: 249.90, totalPrice: 249.90 }],
    },
  ],
}

describe('BatchStatusView', () => {
  it('shows empty state when no batch ID is provided', () => {
    render(<BatchStatusView />, { wrapper })
    expect(screen.getByText('Enter a Batch ID to view its status')).toBeInTheDocument()
  })

  it('fetches and displays batch data when initialBatchJobId is set', async () => {
    vi.mocked(client.getBatchJob).mockResolvedValueOnce(mockBatch)
    render(<BatchStatusView initialBatchJobId="test-batch-id" />, { wrapper })

    await waitFor(() => {
      // Multiple "Completed" badges are expected (job + order); check at least one exists
      expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('shows not found message on 404', async () => {
    vi.mocked(client.getBatchJob).mockRejectedValueOnce(new client.ApiError(404, 'ENTITY_NOT_FOUND', 'Not found.'))
    render(<BatchStatusView initialBatchJobId="bad-id" />, { wrapper })

    await waitFor(() => {
      expect(screen.getByText('Batch job not found')).toBeInTheDocument()
    })
  })

  it('searches for a new batch ID when search is submitted', async () => {
    vi.mocked(client.getBatchJob).mockResolvedValue(mockBatch)
    render(<BatchStatusView />, { wrapper })

    await userEvent.type(screen.getByLabelText('Batch ID'), 'test-batch-id')
    await userEvent.click(screen.getByText('Search'))

    await waitFor(() => {
      expect(client.getBatchJob).toHaveBeenCalledWith('test-batch-id')
    })
  })
})

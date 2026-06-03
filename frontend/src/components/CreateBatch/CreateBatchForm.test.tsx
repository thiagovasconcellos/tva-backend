import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CreateBatchForm } from './CreateBatchForm'
import * as client from '../../api/client'

vi.mock('../../api/client')

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('CreateBatchForm', () => {
  it('renders with one order and one item row', () => {
    render(<CreateBatchForm />, { wrapper })
    expect(screen.getByText('Order 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Customer name')).toBeInTheDocument()
    expect(screen.getByLabelText('Product name')).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<CreateBatchForm />, { wrapper })
    fireEvent.click(screen.getByText(/submit batch/i))
    await waitFor(() => {
      expect(screen.getByText('Customer name is required')).toBeInTheDocument()
    })
  })

  it('adds a second order when "Add order" is clicked', async () => {
    render(<CreateBatchForm />, { wrapper })
    await userEvent.click(screen.getByText('Add order'))
    expect(screen.getByText('Order 2')).toBeInTheDocument()
  })

  it('removes an order when "Remove order" is clicked', async () => {
    render(<CreateBatchForm />, { wrapper })
    await userEvent.click(screen.getByText('Add order'))
    expect(screen.getByText('Order 2')).toBeInTheDocument()
    const removeButtons = screen.getAllByText('Remove order')
    await userEvent.click(removeButtons[0])
    expect(screen.queryByText('Order 2')).not.toBeInTheDocument()
  })

  it('calls processBatch and shows success result', async () => {
    const mockResult = { batchJobId: 'abc-123', totalOrders: 1, completedOrders: 1, failedOrders: 0, status: 'Completed' }
    vi.mocked(client.processBatch).mockResolvedValueOnce(mockResult)

    render(<CreateBatchForm />, { wrapper })

    await userEvent.type(screen.getByLabelText('Customer name'), 'Alice')
    await userEvent.type(screen.getByLabelText('Product name'), 'Keyboard')
    await userEvent.clear(screen.getByLabelText('Quantity'))
    await userEvent.type(screen.getByLabelText('Quantity'), '2')
    await userEvent.type(screen.getByLabelText('Unit price'), '99.90')

    await userEvent.click(screen.getByText(/submit batch/i))

    await waitFor(() => {
      expect(screen.getByText('Batch submitted successfully')).toBeInTheDocument()
      expect(screen.getByText('abc-123')).toBeInTheDocument()
    })
  })
})

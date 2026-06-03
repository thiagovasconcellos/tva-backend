import type { GetBatchOutput, ProcessBatchOutput, ProcessBatchRequest } from '../types/api'

class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) return response.json() as Promise<T>

  let code = 'UNKNOWN_ERROR'
  let message = `HTTP ${response.status}`
  try {
    const body = (await response.json()) as { code?: string; message?: string }
    code = body.code ?? code
    message = body.message ?? message
  } catch {
    // ignore parse error, keep defaults
  }
  throw new ApiError(response.status, code, message)
}

export async function processBatch(request: ProcessBatchRequest): Promise<ProcessBatchOutput> {
  const response = await fetch('/api/batch-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  return handleResponse<ProcessBatchOutput>(response)
}

export async function getBatchJob(batchJobId: string): Promise<GetBatchOutput> {
  const response = await fetch(`/api/batch-orders/${batchJobId}`)
  return handleResponse<GetBatchOutput>(response)
}

export { ApiError }

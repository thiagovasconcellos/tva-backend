import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ProcessBatchOutput } from './types/api'
import { CreateBatchForm } from './components/CreateBatch/CreateBatchForm'
import { AutoBatchForm } from './components/AutoBatch/AutoBatchForm'
import { BatchStatusView } from './components/BatchStatus/BatchStatusView'

const queryClient = new QueryClient()

type Tab = 'create' | 'auto' | 'status'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('create')
  const [batchIdToView, setBatchIdToView] = useState<string>('')

  const handleBatchSuccess = (result: ProcessBatchOutput) => {
    setBatchIdToView(result.batchJobId)
    setActiveTab('status')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M1 1.75A.75.75 0 011.75 1h1.628a1.75 1.75 0 011.734 1.51L5.18 3a65.25 65.25 0 0113.36 1.412.75.75 0 01.58.875 48.645 48.645 0 01-1.618 6.2.75.75 0 01-.712.513H6a2.5 2.5 0 000 5h3.25a.75.75 0 010 1.5H6a4 4 0 01-3.97-3.53L.99 2.256A.25.25 0 00.75 2H.25a.75.75 0 010-1.5h1.5z" />
                  <path d="M6 14.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm9.5 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900">Order Processing API</h1>
                <p className="text-xs text-slate-500">Multi-threading demo — parallel batch processing</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-3xl px-4">
            <nav className="-mb-px flex gap-6">
              <TabButton active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Create Batch
              </TabButton>
              <TabButton active={activeTab === 'auto'} onClick={() => setActiveTab('auto')} highlight>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                </svg>
                Auto Batch
              </TabButton>
              <TabButton active={activeTab === 'status'} onClick={() => setActiveTab('status')}>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                Check Status
              </TabButton>
            </nav>
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-3xl px-4 py-8">
          {activeTab === 'create' && (
            <section className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800">New Batch Order</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add multiple orders manually. All of them are processed in <strong>parallel</strong> using{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-indigo-600">Task.WhenAll</code>
                  {' '}with a{' '}
                  <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-indigo-600">SemaphoreSlim(5)</code>
                  {' '}concurrency gate.
                </p>
              </div>
              <CreateBatchForm onSuccess={handleBatchSuccess} />
            </section>
          )}

          {activeTab === 'auto' && (
            <section className="animate-fade-in">
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-800">Auto Batch Generator</h2>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                    Load test
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Choose how many orders to generate. Names, products, quantities, and prices are randomised
                  automatically — useful for stress-testing the parallel processing pipeline.
                </p>
              </div>
              <AutoBatchForm onSuccess={handleBatchSuccess} />
            </section>
          )}

          {activeTab === 'status' && (
            <section className="animate-fade-in">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800">Batch Status</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter a Batch ID to see all orders and their individual processing results.
                </p>
              </div>
              <BatchStatusView initialBatchJobId={batchIdToView} />
            </section>
          )}
        </main>
      </div>
    </QueryClientProvider>
  )
}

function TabButton({
  active,
  onClick,
  highlight,
  children,
}: {
  active: boolean
  onClick: () => void
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-2 border-b-2 px-1 py-3.5 text-sm font-medium transition-colors',
        active
          ? highlight
            ? 'border-violet-600 text-violet-600'
            : 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export default App

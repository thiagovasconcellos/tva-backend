# Order Processing API

A .NET 8 REST API built with **Clean Architecture** and **Clean Code** principles, designed as a hands-on example of **multi-threading patterns** in C#.

The domain is a batch order processing system: clients submit multiple orders at once, and the API processes all of them **concurrently** — demonstrating `Task.WhenAll`, `SemaphoreSlim`, and `CancellationToken` in a realistic scenario.

---

## Table of Contents

- [Architecture](#architecture)
- [Multi-threading Design](#multi-threading-design)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

---

## Architecture

The solution follows **Clean Architecture**, where dependencies always point inward — outer layers know about inner layers, never the reverse.

```
┌─────────────────────────────────────────────────┐
│                    API Layer                    │  ← HTTP, Controllers, Middleware
├─────────────────────────────────────────────────┤
│               Application Layer                 │  ← Use Cases, DTOs, Interfaces
├───────────────────────┬─────────────────────────┤
│    Infrastructure     │     CrossCutting         │  ← EF Core, Repos | Logging, Exceptions
├───────────────────────┴─────────────────────────┤
│                  Domain Layer                   │  ← Entities, Enums, Domain Rules
└─────────────────────────────────────────────────┘
         ↑ dependencies point inward only ↑
```

### Layer responsibilities

| Layer | Responsibility |
|---|---|
| **Domain** | Business entities (`Order`, `BatchJob`, `OrderItem`), domain rules, repository interfaces. Has **zero** external dependencies. |
| **Application** | Use cases (`ProcessBatchOrders`, `GetBatchJob`), DTOs, use case interfaces. Orchestrates domain objects. |
| **Infrastructure** | EF Core `DbContext`, entity mappings, repository implementations, SQL Server connectivity. |
| **CrossCutting** | Structured logging (source generators), application exceptions, shared DI extensions. |
| **API** | Controllers, global exception middleware, Swagger setup, `Program.cs` composition root. |

---

## Multi-threading Design

### Why batch processing benefits from parallelism

Processing N orders sequentially means each order waits for the previous one to finish — I/O time (DB writes, simulated external calls) is wasted:

```
Sequential:  [Order 1]──[Order 2]──[Order 3]──[Order 4]──[Order 5]  → slow
Parallel:    [Order 1]
             [Order 2]
             [Order 3]  → all running at the same time → fast
             [Order 4]
             [Order 5]
```

### Three patterns demonstrated

**1. `Task.WhenAll` — concurrent execution**

```csharp
var processingTasks = input.Orders
    .Select(order => ProcessSingleOrderAsync(order, ...))
    .ToList();

// Launches all tasks concurrently, waits until every one completes.
var results = await Task.WhenAll(processingTasks);
```

**2. `SemaphoreSlim` — concurrency throttling**

Without a limit, `Task.WhenAll` would fire all tasks simultaneously. For 10,000 orders that would overwhelm the database. `SemaphoreSlim` acts as a gate — at most `MaxConcurrency` tasks run at the same time:

```csharp
private const int MaxConcurrency = 5;
var semaphore = new SemaphoreSlim(MaxConcurrency);

// Inside each task:
await semaphore.WaitAsync(cancellationToken); // blocks until a slot is free
try   { /* process order */ }
finally { semaphore.Release(); }             // always frees the slot
```

**3. `CancellationToken` — cooperative cancellation**

Every async call in the chain accepts a `CancellationToken`. If the HTTP client disconnects mid-request, the entire parallel operation is cancelled cleanly without orphaned DB transactions.

### Where to find it

- Core logic: [ProcessBatchOrdersUseCase.cs](src/OrderProcessing.Application/UseCases/Orders/ProcessBatch/ProcessBatchOrdersUseCase.cs)
- Controller that calls it: [BatchOrdersController.cs](src/OrderProcessing.API/Controllers/BatchOrdersController.cs)

---

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| Runtime | **.NET 8** | LTS, latest performance improvements, `Parallel.ForEachAsync` and collection expression support |
| Database | **SQL Server 2022** (via Docker) | Industry standard, first-class EF Core support |
| ORM | **Entity Framework Core 8** | Auto-migrations, strongly typed queries, clean separation via `IEntityTypeConfiguration` |
| API Docs | **Swagger / Swashbuckle** | Zero-config interactive docs, generated from XML comments |
| Logging | **`LoggerMessage` source generators** | Compile-time log method generation — no boxing, no string allocations on the hot path |
| Containerization | **Docker + Docker Compose** | Reproducible dev environment, SQL Server spun up with a single command |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) — only needed for local development

### Option A — Full Docker (API + SQL Server)

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd tva-backend

# 2. (Optional) Override the SA password
cp .env.example .env
# edit .env if you want a custom password

# 3. Start everything
docker compose up --build
```

The API will be available at `http://localhost:5000` and Swagger at `http://localhost:5000/swagger`.

> The API automatically runs pending EF migrations on startup — no manual step needed.

---

### Option B — Local API + Dockerized SQL Server

```bash
# 1. Start only the database
docker compose up sqlserver

# 2. Run the API locally
dotnet run --project src/OrderProcessing.API
```

The local API reads connection string from `appsettings.Development.json`, which already points to `localhost:1433` with the default password.

---

### Stopping

```bash
docker compose down          # stop containers
docker compose down -v       # stop + delete the SQL Server volume (wipes the DB)
```

---

## API Reference

Base URL: `http://localhost:5000` (Docker) or `https://localhost:7xxx` (local)

Interactive docs: `GET /swagger`

---

### POST `/api/batch-orders`

Submits a list of orders for **parallel processing**. Each order is processed concurrently — the response is returned only after all orders are done.

**Request body**

```json
{
  "orders": [
    {
      "customerName": "Alice Johnson",
      "items": [
        { "productName": "Mechanical Keyboard", "quantity": 1, "unitPrice": 249.90 },
        { "productName": "USB-C Hub",           "quantity": 2, "unitPrice":  59.99 }
      ]
    },
    {
      "customerName": "Bob Smith",
      "items": [
        { "productName": "Monitor 4K", "quantity": 1, "unitPrice": 1199.00 }
      ]
    }
  ]
}
```

**Response — `202 Accepted`**

```json
{
  "batchJobId":      "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "totalOrders":     2,
  "completedOrders": 2,
  "failedOrders":    0,
  "status":          "Completed"
}
```

| Field | Description |
|---|---|
| `batchJobId` | Use this ID to query the batch results |
| `status` | `Completed` · `PartiallyCompleted` (some orders failed) |

**Error responses**

| Status | Code | When |
|---|---|---|
| `400` | `EMPTY_BATCH` | Request body has no orders |
| `422` | `INVALID_STATUS_TRANSITION` | Domain rule violation |

---

### GET `/api/batch-orders/{batchJobId}`

Returns the full status of a batch job, including every individual order and its items.

**Example**

```
GET /api/batch-orders/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Response — `200 OK`**

```json
{
  "batchJobId":      "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status":          "Completed",
  "createdAt":       "2026-06-03T20:50:00Z",
  "completedAt":     "2026-06-03T20:50:01Z",
  "totalOrders":     2,
  "completedOrders": 2,
  "failedOrders":    0,
  "orders": [
    {
      "id":           "a1b2c3d4-...",
      "customerName": "Alice Johnson",
      "status":       "Completed",
      "totalAmount":  369.88,
      "createdAt":    "2026-06-03T20:50:00Z",
      "processedAt":  "2026-06-03T20:50:01Z",
      "errorMessage": null,
      "items": [
        { "id": "...", "productName": "Mechanical Keyboard", "quantity": 1, "unitPrice": 249.90, "totalPrice": 249.90 },
        { "id": "...", "productName": "USB-C Hub",           "quantity": 2, "unitPrice":  59.99, "totalPrice": 119.98 }
      ]
    }
  ]
}
```

**Error responses**

| Status | Code | When |
|---|---|---|
| `404` | `ENTITY_NOT_FOUND` | `batchJobId` does not exist |

---

## Project Structure

```
.
├── docker-compose.yml                     # SQL Server + API orchestration
├── .env.example                           # Environment variable template
├── OrderProcessing.sln
└── src/
    ├── OrderProcessing.Domain/
    │   ├── Entities/
    │   │   ├── BatchJob.cs                # Aggregate root — tracks job state
    │   │   ├── Order.cs                   # Aggregate root — owns OrderItems
    │   │   └── OrderItem.cs
    │   ├── Enums/
    │   │   ├── BatchJobStatus.cs
    │   │   └── OrderStatus.cs
    │   ├── Exceptions/
    │   │   ├── DomainException.cs
    │   │   └── EntityNotFoundException.cs
    │   └── Interfaces/Repositories/
    │       ├── IRepository.cs             # Generic base interface
    │       ├── IBatchJobRepository.cs
    │       └── IOrderRepository.cs
    │
    ├── OrderProcessing.Application/
    │   ├── DTOs/                          # Input/Output data contracts
    │   ├── Interfaces/UseCases/           # Use case contracts (for DI)
    │   ├── UseCases/Orders/
    │   │   ├── ProcessBatch/
    │   │   │   ├── ProcessBatchInput.cs
    │   │   │   ├── ProcessBatchOutput.cs
    │   │   │   └── ProcessBatchOrdersUseCase.cs  ← multi-threading here
    │   │   └── GetBatch/
    │   │       ├── GetBatchInput.cs
    │   │       ├── GetBatchOutput.cs
    │   │       └── GetBatchJobUseCase.cs
    │   └── DependencyInjection/
    │       └── ServiceCollectionExtensions.cs
    │
    ├── OrderProcessing.CrossCutting/
    │   ├── Exceptions/AppException.cs
    │   ├── Logging/LogMessages.cs         # Source-generated log methods
    │   └── Extensions/ServiceCollectionExtensions.cs
    │
    ├── OrderProcessing.Infrastructure/
    │   ├── Data/
    │   │   ├── Context/ApplicationDbContext.cs
    │   │   ├── Mappings/                  # IEntityTypeConfiguration per entity
    │   │   ├── Migrations/                # EF Core auto-generated migrations
    │   │   └── Repositories/
    │   └── DependencyInjection/
    │       └── ServiceCollectionExtensions.cs
    │
    └── OrderProcessing.API/
        ├── Controllers/
        │   └── BatchOrdersController.cs   # Two endpoints
        ├── Middleware/
        │   └── ExceptionMiddleware.cs     # Global error handling
        ├── Dockerfile
        └── Program.cs                     # Composition root
```

using Microsoft.AspNetCore.Mvc;
using OrderProcessing.Application.DTOs;
using OrderProcessing.Application.Interfaces.UseCases;
using OrderProcessing.Application.UseCases.Orders.GetBatch;
using OrderProcessing.Application.UseCases.Orders.ProcessBatch;

namespace OrderProcessing.API.Controllers;

[ApiController]
[Route("api/batch-orders")]
[Produces("application/json")]
public class BatchOrdersController : ControllerBase
{
    private readonly IProcessBatchOrdersUseCase _processBatchOrdersUseCase;
    private readonly IGetBatchJobUseCase _getBatchJobUseCase;

    public BatchOrdersController(
        IProcessBatchOrdersUseCase processBatchOrdersUseCase,
        IGetBatchJobUseCase getBatchJobUseCase)
    {
        _processBatchOrdersUseCase = processBatchOrdersUseCase;
        _getBatchJobUseCase = getBatchJobUseCase;
    }

    /// <summary>
    /// Submits a batch of orders for parallel processing.
    /// Each order is processed concurrently using Task.WhenAll + SemaphoreSlim.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProcessBatchOutput), StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ProcessBatch(
        [FromBody] ProcessBatchRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Orders is null || request.Orders.Count == 0)
            return BadRequest(new { code = "EMPTY_BATCH", message = "At least one order is required." });

        var input = new ProcessBatchInput(request.Orders
            .Select(o => new OrderInput(
                o.CustomerName,
                o.Items.Select(i => new OrderItemInput(i.ProductName, i.Quantity, i.UnitPrice)).ToList()))
            .ToList());

        var result = await _processBatchOrdersUseCase.ExecuteAsync(input, cancellationToken);

        return Accepted(result);
    }

    /// <summary>
    /// Retrieves the status and results of a previously submitted batch job.
    /// </summary>
    [HttpGet("{batchJobId:guid}")]
    [ProducesResponseType(typeof(GetBatchOutput), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBatchJob(Guid batchJobId, CancellationToken cancellationToken)
    {
        var result = await _getBatchJobUseCase.ExecuteAsync(new GetBatchInput(batchJobId), cancellationToken);
        return Ok(result);
    }
}

// Request models (API boundary — kept separate from Application DTOs)
public record ProcessBatchRequest(List<OrderRequest> Orders);

public record OrderRequest(string CustomerName, List<OrderItemRequest> Items);

public record OrderItemRequest(string ProductName, int Quantity, decimal UnitPrice);

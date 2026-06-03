using Microsoft.Extensions.DependencyInjection;
using OrderProcessing.Application.Interfaces.UseCases;
using OrderProcessing.Application.UseCases.Orders.GetBatch;
using OrderProcessing.Application.UseCases.Orders.ProcessBatch;

namespace OrderProcessing.Application.DependencyInjection;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProcessBatchOrdersUseCase, ProcessBatchOrdersUseCase>();
        services.AddScoped<IGetBatchJobUseCase, GetBatchJobUseCase>();

        return services;
    }
}

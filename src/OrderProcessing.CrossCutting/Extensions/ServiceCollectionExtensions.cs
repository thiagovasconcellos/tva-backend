using Microsoft.Extensions.DependencyInjection;

namespace OrderProcessing.CrossCutting.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCrossCuttingServices(this IServiceCollection services)
    {
        return services;
    }
}

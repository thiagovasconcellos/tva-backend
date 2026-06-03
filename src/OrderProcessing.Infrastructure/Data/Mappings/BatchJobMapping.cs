using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderProcessing.Domain.Entities;

namespace OrderProcessing.Infrastructure.Data.Mappings;

public class BatchJobMapping : IEntityTypeConfiguration<BatchJob>
{
    public void Configure(EntityTypeBuilder<BatchJob> builder)
    {
        builder.ToTable("BatchJobs");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .ValueGeneratedNever();

        builder.Property(b => b.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(b => b.CreatedAt)
            .IsRequired();

        builder.Property(b => b.TotalOrders)
            .IsRequired();

        builder.Property(b => b.CompletedOrders)
            .IsRequired();

        builder.Property(b => b.FailedOrders)
            .IsRequired();
    }
}

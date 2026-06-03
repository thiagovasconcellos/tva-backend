using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderProcessing.Domain.Entities;

namespace OrderProcessing.Infrastructure.Data.Mappings;

public class OrderMapping : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .ValueGeneratedNever();

        builder.Property(o => o.BatchJobId)
            .IsRequired();

        builder.Property(o => o.CustomerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(o => o.ErrorMessage)
            .HasMaxLength(1000);

        // EF needs to access the private _items backing field
        builder.Navigation(o => o.Items)
            .HasField("_items");

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<BatchJob>()
            .WithMany()
            .HasForeignKey(o => o.BatchJobId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

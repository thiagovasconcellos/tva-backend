namespace OrderProcessing.Domain.Exceptions;

public class EntityNotFoundException : DomainException
{
    public EntityNotFoundException(string entityName, object id)
        : base("ENTITY_NOT_FOUND", $"{entityName} with id '{id}' was not found.")
    {
    }
}

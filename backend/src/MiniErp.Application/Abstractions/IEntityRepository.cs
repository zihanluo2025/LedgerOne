namespace MiniErp.Application.Abstractions;

// Persistence contract shared by document-style aggregates.
// Implementations are scoped to the current organisation and hide soft-deleted records.
public interface IEntityRepository<T> where T : class
{
    Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default);

    Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default);

    // Insert or replace.
    Task SaveAsync(T entity, CancellationToken cancellationToken = default);

    // Soft delete. Returns false when the record does not exist (or is already deleted).
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}

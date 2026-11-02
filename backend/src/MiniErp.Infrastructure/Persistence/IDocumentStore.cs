namespace MiniErp.Infrastructure.Persistence;

// Org-partitioned JSON document storage with soft delete.
public interface IDocumentStore
{
    Task<T?> GetAsync<T>(string orgId, string entityType, string id, CancellationToken ct) where T : class;

    Task<IReadOnlyList<T>> ListAsync<T>(string orgId, string entityType, CancellationToken ct) where T : class;

    Task PutAsync<T>(string orgId, string entityType, string id, T document, CancellationToken ct) where T : class;

    Task<bool> SoftDeleteAsync(string orgId, string entityType, string id, string deletedBy, CancellationToken ct);
}

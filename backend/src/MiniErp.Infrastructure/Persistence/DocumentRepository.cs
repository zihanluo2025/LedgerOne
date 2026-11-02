using MiniErp.Application.Abstractions;

namespace MiniErp.Infrastructure.Persistence;

// Base repository binding an aggregate type to its entity prefix and the current organisation.
public abstract class DocumentRepository<T> : IEntityRepository<T> where T : class
{
    private readonly IDocumentStore _store;
    private readonly ICurrentUser _currentUser;

    protected DocumentRepository(IDocumentStore store, ICurrentUser currentUser)
    {
        _store = store;
        _currentUser = currentUser;
    }

    protected abstract string EntityType { get; }

    protected abstract string GetId(T entity);

    public Task<IReadOnlyList<T>> ListAsync(CancellationToken cancellationToken = default)
        => _store.ListAsync<T>(_currentUser.OrgId, EntityType, cancellationToken);

    public Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => string.IsNullOrWhiteSpace(id)
            ? Task.FromResult<T?>(null)
            : _store.GetAsync<T>(_currentUser.OrgId, EntityType, id, cancellationToken);

    public Task SaveAsync(T entity, CancellationToken cancellationToken = default)
        => _store.PutAsync(_currentUser.OrgId, EntityType, GetId(entity), entity, cancellationToken);

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
        => _store.SoftDeleteAsync(_currentUser.OrgId, EntityType, id, _currentUser.UserId, cancellationToken);
}

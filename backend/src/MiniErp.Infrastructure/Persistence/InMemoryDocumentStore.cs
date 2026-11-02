using System.Collections.Concurrent;

namespace MiniErp.Infrastructure.Persistence;

// Local development store. Documents are kept as JSON so callers never share mutable instances.
public sealed class InMemoryDocumentStore : IDocumentStore
{
    private sealed record Entry(string Json, bool IsDeleted);

    private readonly ConcurrentDictionary<string, Entry> _items = new();

    public Task<T?> GetAsync<T>(string orgId, string entityType, string id, CancellationToken ct) where T : class
    {
        var found = _items.TryGetValue(Key(orgId, entityType, id), out var entry) && !entry.IsDeleted;
        return Task.FromResult(found ? DocumentJson.Deserialize<T>(entry!.Json) : null);
    }

    public Task<IReadOnlyList<T>> ListAsync<T>(string orgId, string entityType, CancellationToken ct) where T : class
    {
        var prefix = $"{orgId}|{entityType}|";
        IReadOnlyList<T> items = _items
            .Where(kv => kv.Key.StartsWith(prefix, StringComparison.Ordinal) && !kv.Value.IsDeleted)
            .Select(kv => DocumentJson.Deserialize<T>(kv.Value.Json))
            .ToList();

        return Task.FromResult(items);
    }

    public Task PutAsync<T>(string orgId, string entityType, string id, T document, CancellationToken ct) where T : class
    {
        _items[Key(orgId, entityType, id)] = new Entry(DocumentJson.Serialize(document), false);
        return Task.CompletedTask;
    }

    public Task<bool> SoftDeleteAsync(string orgId, string entityType, string id, string deletedBy, CancellationToken ct)
    {
        var key = Key(orgId, entityType, id);
        if (!_items.TryGetValue(key, out var entry) || entry.IsDeleted)
            return Task.FromResult(false);

        return Task.FromResult(_items.TryUpdate(key, entry with { IsDeleted = true }, entry));
    }

    private static string Key(string orgId, string entityType, string id) => $"{orgId}|{entityType}|{id}";
}

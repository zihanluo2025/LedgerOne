using System.Globalization;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;

namespace MiniErp.Infrastructure.Persistence;

// Single-table layout: PK = ORG#{orgId}, SK = {ENTITY}#{id}, document body stored as JSON in "Data".
public sealed class DynamoDbDocumentStore : IDocumentStore
{
    private readonly IAmazonDynamoDB _ddb;
    private readonly string _table;

    public DynamoDbDocumentStore(IAmazonDynamoDB ddb, string tableName)
    {
        _ddb = ddb;
        _table = tableName;
    }

    public async Task<T?> GetAsync<T>(string orgId, string entityType, string id, CancellationToken ct) where T : class
    {
        var resp = await _ddb.GetItemAsync(new GetItemRequest
        {
            TableName = _table,
            Key = Key(orgId, entityType, id),
            ConsistentRead = true
        }, ct);

        if (resp.Item is null || resp.Item.Count == 0 || IsDeleted(resp.Item)) return null;

        return DocumentJson.Deserialize<T>(resp.Item["Data"].S);
    }

    public async Task<IReadOnlyList<T>> ListAsync<T>(string orgId, string entityType, CancellationToken ct) where T : class
    {
        var results = new List<T>();
        Dictionary<string, AttributeValue>? startKey = null;

        do
        {
            var resp = await _ddb.QueryAsync(new QueryRequest
            {
                TableName = _table,
                KeyConditionExpression = "PK = :pk AND begins_with(SK, :prefix)",
                FilterExpression = "attribute_not_exists(IsDeleted) OR IsDeleted = :false",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":pk"] = new() { S = Pk(orgId) },
                    [":prefix"] = new() { S = $"{entityType}#" },
                    [":false"] = new() { BOOL = false }
                },
                ExclusiveStartKey = startKey
            }, ct);

            results.AddRange(resp.Items
                .Where(item => item.ContainsKey("Data"))
                .Select(item => DocumentJson.Deserialize<T>(item["Data"].S)));

            startKey = resp.LastEvaluatedKey is { Count: > 0 } ? resp.LastEvaluatedKey : null;
        }
        while (startKey is not null);

        return results;
    }

    public Task PutAsync<T>(string orgId, string entityType, string id, T document, CancellationToken ct) where T : class
    {
        var item = Key(orgId, entityType, id);
        item["EntityType"] = new AttributeValue { S = entityType };
        item["Id"] = new AttributeValue { S = id };
        item["Data"] = new AttributeValue { S = DocumentJson.Serialize(document) };
        item["IsDeleted"] = new AttributeValue { BOOL = false };
        item["UpdatedAt"] = new AttributeValue { S = DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture) };

        return _ddb.PutItemAsync(new PutItemRequest { TableName = _table, Item = item }, ct);
    }

    public async Task<bool> SoftDeleteAsync(string orgId, string entityType, string id, string deletedBy, CancellationToken ct)
    {
        try
        {
            await _ddb.UpdateItemAsync(new UpdateItemRequest
            {
                TableName = _table,
                Key = Key(orgId, entityType, id),
                ConditionExpression = "attribute_exists(PK) AND (attribute_not_exists(IsDeleted) OR IsDeleted = :false)",
                UpdateExpression = "SET IsDeleted = :true, DeletedAt = :at, DeletedBy = :by",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":true"] = new() { BOOL = true },
                    [":false"] = new() { BOOL = false },
                    [":at"] = new() { S = DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture) },
                    [":by"] = new() { S = deletedBy }
                }
            }, ct);

            return true;
        }
        catch (ConditionalCheckFailedException)
        {
            return false;
        }
    }

    private static string Pk(string orgId) => $"ORG#{orgId}";

    private static Dictionary<string, AttributeValue> Key(string orgId, string entityType, string id) => new()
    {
        ["PK"] = new AttributeValue { S = Pk(orgId) },
        ["SK"] = new AttributeValue { S = $"{entityType}#{id}" }
    };

    private static bool IsDeleted(Dictionary<string, AttributeValue> item)
        => item.TryGetValue("IsDeleted", out var v) && (v.BOOL ?? false);
}

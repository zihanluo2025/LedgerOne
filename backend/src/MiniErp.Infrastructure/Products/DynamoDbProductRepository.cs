using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Products;
using MiniErp.Application.Products.Models;
using System.Text;
using System.Text.Json;

namespace MiniErp.Infrastructure.Products;

// Comments in English.
public sealed class DynamoDbProductRepository : IProductRepository
{
    private readonly IAmazonDynamoDB _ddb;
    private readonly string _table;

    public DynamoDbProductRepository(IAmazonDynamoDB ddb, string tableName)
    {
        _ddb = ddb;
        _table = tableName;
    }

    private static string Pk(string orgId) => $"ORG#{orgId}";
    private static string SkProduct(string productId) => $"PRODUCT#{productId}";

    public async Task CreateAsync(string orgId, ProductDto product, CancellationToken ct)
    {
        var item = new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = Pk(orgId) },
            ["SK"] = new AttributeValue { S = SkProduct(product.Id) },

            ["Id"] = new AttributeValue { S = product.Id },
            ["Name"] = new AttributeValue { S = product.Name },

            ["Supplier"] = new AttributeValue { S = product.Supplier ?? "" },
            ["Origin"] = new AttributeValue { S = product.Origin ?? "" },

            ["Price"] = new AttributeValue { N = product.Price.ToString() },
            ["Stock"] = new AttributeValue { N = product.Stock.ToString() },

            ["Status"] = new AttributeValue { S = product.Status.ToString() },

            ["IsDeleted"] = new AttributeValue { BOOL = product.IsDeleted },

            ["CreatedAt"] = new AttributeValue { S = product.CreatedAt.ToString("O") },
            ["CreatedBy"] = new AttributeValue { S = product.CreatedBy ?? "" },
            ["UpdatedAt"] = new AttributeValue { S = product.UpdatedAt.ToString("O") },
            ["UpdatedBy"] = new AttributeValue { S = product.UpdatedBy ?? "" },
        };

        await _ddb.PutItemAsync(new PutItemRequest
        {
            TableName = _table,
            Item = item
        }, ct);
    }

    public async Task<ProductDto?> GetAsync(string orgId, string productId, CancellationToken ct)
    {
        var resp = await _ddb.GetItemAsync(new GetItemRequest
        {
            TableName = _table,
            Key = new Dictionary<string, AttributeValue>
            {
                ["PK"] = new AttributeValue { S = Pk(orgId) },
                ["SK"] = new AttributeValue { S = SkProduct(productId) }
            }
        }, ct);

        if (resp.Item is null || resp.Item.Count == 0) return null;

        var dto = MapToDto(resp.Item);
        return dto.IsDeleted ? null : dto;
    }

    public async Task<IReadOnlyList<ProductDto>> ListAsync(string orgId, string? keyword, int limit, string? cursor, CancellationToken ct)
    {
        var safeLimit = Math.Clamp(limit, 1, 1000);
        var results = new List<ProductDto>();
        var startKey = DecodeCursor(cursor);

        // Keep paging until enough non-deleted, keyword-matching rows are collected.
        do
        {
            var resp = await _ddb.QueryAsync(new QueryRequest
            {
                TableName = _table,
                KeyConditionExpression = "PK = :pk AND begins_with(SK, :prefix)",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                {
                    [":pk"] = new AttributeValue { S = Pk(orgId) },
                    [":prefix"] = new AttributeValue { S = "PRODUCT#" }
                },
                ScanIndexForward = false,
                ExclusiveStartKey = startKey
            }, ct);

            results.AddRange(Filter(resp.Items.Select(MapToDto), keyword));
            startKey = resp.LastEvaluatedKey is { Count: > 0 } ? resp.LastEvaluatedKey : null;
        }
        while (startKey is not null && results.Count < safeLimit);

        return results.Take(safeLimit).ToList();
    }

    public async Task<PagedResult<ProductDto>> PageListAsync(
        string orgId,
        string? keyword,
        int limit,
        string? cursor,
        CancellationToken ct)
    {
        var safeLimit = Math.Clamp(limit, 1, 200);

        var req = new QueryRequest
        {
            TableName = _table,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :prefix)",
            ExpressionAttributeValues = new Dictionary<string, AttributeValue>
            {
                [":pk"] = new AttributeValue { S = Pk(orgId) },
                [":prefix"] = new AttributeValue { S = "PRODUCT#" }
            },
            Limit = safeLimit,
            ScanIndexForward = false
        };

        var startKey = DecodeCursor(cursor);
        if (startKey is not null)
            req.ExclusiveStartKey = startKey;

        var resp = await _ddb.QueryAsync(req, ct);

        var items = Filter(resp.Items.Select(MapToDto), keyword).ToList();

        string? nextCursor = (resp.LastEvaluatedKey is { Count: > 0 })
            ? EncodeCursor(resp.LastEvaluatedKey)
            : null;

        return new PagedResult<ProductDto>(items, nextCursor);
    }

    public async Task UpdateAsync(string orgId, ProductDto product, CancellationToken ct)
    {
        // Simple upsert
        await CreateAsync(orgId, product, ct);
    }

    public async Task SoftDeleteAsync(string orgId, string productId, CancellationToken ct)
    {
        var existing = await GetAsync(orgId, productId, ct);
        if (existing is null) return;

        var deleted = existing with
        {
            IsDeleted = true,
            UpdatedAt = DateTimeOffset.UtcNow,
            UpdatedBy = "system"
        };

        await UpdateAsync(orgId, deleted, ct);
    }

    private static IEnumerable<ProductDto> Filter(IEnumerable<ProductDto> items, string? keyword)
    {
        var q = items.Where(x => !x.IsDeleted);
        if (string.IsNullOrWhiteSpace(keyword)) return q;

        var k = keyword.Trim();
        return q.Where(x =>
            x.Name.Contains(k, StringComparison.OrdinalIgnoreCase) ||
            (x.Supplier ?? "").Contains(k, StringComparison.OrdinalIgnoreCase) ||
            (x.Origin ?? "").Contains(k, StringComparison.OrdinalIgnoreCase));
    }

    private static ProductDto MapToDto(Dictionary<string, AttributeValue> item)
    {
        string GetS(string k) => item.TryGetValue(k, out var v) ? (v.S ?? "") : "";

        decimal GetDecimal(string k)
        {
            if (!item.TryGetValue(k, out var v) || string.IsNullOrWhiteSpace(v.N)) return 0m;
            return decimal.TryParse(v.N, out var n) ? n : 0m;
        }

        int GetInt(string k)
        {
            if (!item.TryGetValue(k, out var v) || string.IsNullOrWhiteSpace(v.N)) return 0;
            return int.TryParse(v.N, out var n) ? n : 0;
        }

        bool GetBool(string k) => item.TryGetValue(k, out var v) && (v.BOOL ?? false);

        DateTimeOffset GetDt(string k)
        {
            var s = GetS(k);
            return DateTime.TryParse(
                s,
                null,
                System.Globalization.DateTimeStyles.RoundtripKind,
                out var dt)
                ? dt
                : DateTime.UtcNow;
        }

        ProductStatus GetStatus(string k)
        {
            var s = GetS(k);
            return Enum.TryParse<ProductStatus>(s, ignoreCase: true, out var st)
                ? st
                : ProductStatus.Active;
        }

        return new ProductDto(
            Id: GetS("Id"),
            Name: GetS("Name"),
            Supplier: GetS("Supplier"),
            Origin: GetS("Origin"),
            Price: GetDecimal("Price"),
            Stock: GetInt("Stock"),
            Status: GetStatus("Status"),
            IsDeleted: GetBool("IsDeleted"),
            CreatedAt: GetDt("CreatedAt"),
            CreatedBy: GetS("CreatedBy"),
            UpdatedAt: GetDt("UpdatedAt"),
            UpdatedBy: GetS("UpdatedBy")
        );
    }

    private static string EncodeCursor(Dictionary<string, AttributeValue> lastKey)
    {
        var payload = new Dictionary<string, string>
        {
            ["PK"] = lastKey["PK"].S!,
            ["SK"] = lastKey["SK"].S!
        };

        var json = JsonSerializer.Serialize(payload);
        return Base64UrlEncode(Encoding.UTF8.GetBytes(json));
    }

    private static Dictionary<string, AttributeValue>? DecodeCursor(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor)) return null;

        var bytes = Base64UrlDecode(cursor);
        var json = Encoding.UTF8.GetString(bytes);

        var payload = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
        if (payload is null || !payload.TryGetValue("PK", out var pk) || !payload.TryGetValue("SK", out var sk))
            return null;

        return new Dictionary<string, AttributeValue>
        {
            ["PK"] = new AttributeValue { S = pk },
            ["SK"] = new AttributeValue { S = sk }
        };
    }

    private static string Base64UrlEncode(byte[] bytes)
        => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static byte[] Base64UrlDecode(string input)
    {
        var s = input.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
        }
        return Convert.FromBase64String(s);
    }
}
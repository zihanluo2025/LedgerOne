using System.Globalization;

namespace MiniErp.Application.Abstractions;

// Offset based cursor paging over an already filtered and ordered sequence.
public static class Paging
{
    public const int DefaultLimit = 50;
    public const int MaxLimit = 1000;

    public static PagedResult<T> Apply<T>(IEnumerable<T> ordered, int limit, string? cursor)
    {
        var safeLimit = Math.Clamp(limit <= 0 ? DefaultLimit : limit, 1, MaxLimit);
        var offset = DecodeCursor(cursor);

        var page = ordered.Skip(offset).Take(safeLimit + 1).ToList();
        var hasMore = page.Count > safeLimit;
        if (hasMore) page.RemoveAt(page.Count - 1);

        var next = hasMore ? (offset + safeLimit).ToString(CultureInfo.InvariantCulture) : null;
        return new PagedResult<T>(page, next);
    }

    private static int DecodeCursor(string? cursor)
    {
        if (string.IsNullOrWhiteSpace(cursor)) return 0;

        return int.TryParse(cursor, NumberStyles.None, CultureInfo.InvariantCulture, out var offset) && offset >= 0
            ? offset
            : throw new ArgumentException("Invalid cursor.");
    }
}

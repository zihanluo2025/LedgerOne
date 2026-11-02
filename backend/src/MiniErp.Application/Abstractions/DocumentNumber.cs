namespace MiniErp.Application.Abstractions;

// Human readable document numbers, e.g. SO-20261102-4F3A9C.
public static class DocumentNumber
{
    public static string Next(string prefix, DateTimeOffset now)
        => $"{prefix}-{now:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";
}

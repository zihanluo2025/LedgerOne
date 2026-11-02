namespace MiniErp.Application.Abstractions;

// Input validation helpers. Violations surface as HTTP 400 via the API exception middleware.
public static class Guard
{
    public static string Required(string? value, string field, int maxLength = 200)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException($"{field} is required.");

        var trimmed = value.Trim();
        if (trimmed.Length > maxLength)
            throw new ArgumentException($"{field} must be within {maxLength} characters.");

        return trimmed;
    }

    public static string? Optional(string? value, string field, int maxLength = 1000)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        var trimmed = value.Trim();
        if (trimmed.Length > maxLength)
            throw new ArgumentException($"{field} must be within {maxLength} characters.");

        return trimmed;
    }

    // Returns the canonical spelling from the allowed list (case-insensitive match).
    public static string OneOf(string? value, string field, IReadOnlyCollection<string> allowed)
    {
        var match = allowed.FirstOrDefault(x => string.Equals(x, value?.Trim(), StringComparison.OrdinalIgnoreCase));
        return match ?? throw new ArgumentException($"{field} must be one of: {string.Join(", ", allowed)}.");
    }

    public static int NonNegative(int value, string field)
        => value >= 0 ? value : throw new ArgumentException($"{field} must be >= 0.");

    public static decimal NonNegative(decimal value, string field)
        => value >= 0 ? value : throw new ArgumentException($"{field} must be >= 0.");

    public static int Positive(int value, string field)
        => value > 0 ? value : throw new ArgumentException($"{field} must be greater than 0.");

    public static bool Contains(string? source, string keyword)
        => source is not null && source.Contains(keyword, StringComparison.OrdinalIgnoreCase);
}

namespace MiniErp.Application.Inbounds;

public static class InboundStatus
{
    public const string Pending = "Pending";
    public const string PartiallyReceived = "Partially Received";
    public const string Completed = "Completed";
    public const string Exception = "Exception";

    public static string Resolve(int receivedQty, int expectedQty, bool hasException)
    {
        if (hasException) return Exception;
        if (receivedQty <= 0) return Pending;
        return receivedQty < expectedQty ? PartiallyReceived : Completed;
    }

    public static bool IsOpen(string status) => status is Pending or PartiallyReceived;
}

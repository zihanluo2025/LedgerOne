using System.Net.Mail;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Customers.Models;

namespace MiniErp.Application.Customers;

public sealed class CustomerService
{
    public static readonly string[] Statuses = ["Active", "Inactive", "Prospect"];
    public static readonly string[] Segments = ["Enterprise", "SME", "Startup"];

    private readonly ICustomerRepository _repository;
    private readonly ICurrentUser _currentUser;
    private readonly IClock _clock;

    public CustomerService(ICustomerRepository repository, ICurrentUser currentUser, IClock clock)
    {
        _repository = repository;
        _currentUser = currentUser;
        _clock = clock;
    }

    public async Task<PagedResult<CustomerDto>> GetCustomersAsync(
        CustomerListQuery query,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<CustomerDto> items = await _repository.ListAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            items = items.Where(x =>
                Guard.Contains(x.CustomerCode, keyword) ||
                Guard.Contains(x.CustomerName, keyword) ||
                Guard.Contains(x.CompanyName, keyword) ||
                Guard.Contains(x.ContactPerson, keyword) ||
                Guard.Contains(x.ContactEmail, keyword) ||
                Guard.Contains(x.Region, keyword));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
            items = items.Where(x => string.Equals(x.Status, query.Status, StringComparison.OrdinalIgnoreCase));

        if (!string.IsNullOrWhiteSpace(query.Segment))
            items = items.Where(x => string.Equals(x.Segment, query.Segment, StringComparison.OrdinalIgnoreCase));

        return Paging.Apply(items.OrderByDescending(x => x.UpdatedAt), query.Limit, query.Cursor);
    }

    public async Task<CustomerSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.ListAsync(cancellationToken);

        return new CustomerSummaryDto(
            items.Count,
            items.Count(x => x.Status == "Active"),
            items.Count(x => x.Segment == "Enterprise"),
            items.Count(x => x.Status == "Prospect"));
    }

    public Task<CustomerDto?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public async Task<CustomerDto> CreateAsync(
        CreateCustomerRequest request,
        CancellationToken cancellationToken = default)
    {
        var code = Guard.Required(request.CustomerCode, "Customer code", 50);
        await EnsureCodeIsUniqueAsync(code, null, cancellationToken);

        var now = _clock.UtcNow.UtcDateTime;
        var item = Map(Guid.NewGuid().ToString("N"), code, request, now, _currentUser.UserId, now);

        await _repository.SaveAsync(item, cancellationToken);
        return item;
    }

    public async Task<CustomerDto?> UpdateAsync(
        string id,
        UpdateCustomerRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _repository.GetByIdAsync(id, cancellationToken);
        if (existing is null) return null;

        var code = Guard.Required(request.CustomerCode, "Customer code", 50);
        await EnsureCodeIsUniqueAsync(code, id, cancellationToken);

        var updated = Map(id, code, request, existing.CreatedAt, existing.CreatedBy, _clock.UtcNow.UtcDateTime);

        await _repository.SaveAsync(updated, cancellationToken);
        return updated;
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);

    public async Task BulkDeleteAsync(IEnumerable<string> ids, CancellationToken cancellationToken = default)
    {
        foreach (var id in ids.Distinct())
            await _repository.DeleteAsync(id, cancellationToken);
    }

    private CustomerDto Map(
        string id,
        string code,
        CustomerRequest request,
        DateTime createdAt,
        string createdBy,
        DateTime now)
        => new(
            id,
            code,
            Guard.Required(request.CustomerName, "Customer name"),
            Guard.Required(request.CompanyName, "Company name"),
            Guard.OneOf(request.Segment, "Segment", Segments),
            Guard.Required(request.ContactPerson, "Contact person", 100),
            ValidateEmail(request.ContactEmail),
            Guard.Optional(request.ContactPhone, "Contact phone", 50),
            Guard.Required(request.Region, "Region", 100),
            Guard.Optional(request.Address, "Address", 300),
            Guard.OneOf(request.Status, "Status", Statuses),
            Guard.Optional(request.Notes, "Notes"),
            createdAt,
            createdBy,
            now,
            _currentUser.UserId);

    private static string? ValidateEmail(string? value)
    {
        var email = Guard.Optional(value, "Contact email", 200);
        if (email is not null && !MailAddress.TryCreate(email, out _))
            throw new ArgumentException("Contact email is not a valid email address.");

        return email;
    }

    private async Task EnsureCodeIsUniqueAsync(string code, string? currentId, CancellationToken cancellationToken)
    {
        var items = await _repository.ListAsync(cancellationToken);
        if (items.Any(x => x.Id != currentId && string.Equals(x.CustomerCode, code, StringComparison.OrdinalIgnoreCase)))
            throw new InvalidOperationException($"Customer code '{code}' already exists.");
    }
}

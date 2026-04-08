using MiniErp.Application.Abstractions;
using MiniErp.Application.Returns.Models;

namespace MiniErp.Application.Returns;

public sealed class ReturnService
{
    private readonly IReturnRepository _repository;

    public ReturnService(IReturnRepository repository)
    {
        _repository = repository;
    }

    public Task<PagedResult<ReturnDto>> GetListAsync(
        ReturnListQuery query,
        CancellationToken cancellationToken = default)
        => _repository.GetListAsync(query, cancellationToken);

    public Task<ReturnDto?> GetByIdAsync(
        string id,
        CancellationToken cancellationToken = default)
        => _repository.GetByIdAsync(id, cancellationToken);

    public Task<ReturnDto> CreateAsync(
        CreateReturnRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.PartnerName))
            throw new ArgumentException("Partner name is required.");

        if (string.IsNullOrWhiteSpace(request.ProductName))
            throw new ArgumentException("Product name is required.");

        if (request.Qty < 0)
            throw new ArgumentException("Quantity must be >= 0.");

        return _repository.CreateAsync(request, cancellationToken);
    }

    public Task<ReturnDto?> UpdateAsync(
        string id,
        UpdateReturnRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.PartnerName))
            throw new ArgumentException("Partner name is required.");

        if (string.IsNullOrWhiteSpace(request.ProductName))
            throw new ArgumentException("Product name is required.");

        if (request.Qty < 0)
            throw new ArgumentException("Quantity must be >= 0.");

        return _repository.UpdateAsync(id, request, cancellationToken);
    }

    public Task<bool> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default)
        => _repository.DeleteAsync(id, cancellationToken);
}

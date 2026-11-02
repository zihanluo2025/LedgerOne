using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;
using MiniErp.Application.Approvals.Models;
using MiniErp.Application.Customers;
using MiniErp.Application.Customers.Models;
using MiniErp.Application.Inbounds;
using MiniErp.Application.Inbounds.Models;
using MiniErp.Application.Orders;
using MiniErp.Application.Orders.Models;
using MiniErp.Application.Profiles;
using MiniErp.Application.Returns;
using MiniErp.Application.Returns.Models;
using MiniErp.Application.Suppliers;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Infrastructure.Persistence;

public sealed class SupplierRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<SupplierDto>(store, currentUser), ISupplierRepository
{
    protected override string EntityType => "SUPPLIER";
    protected override string GetId(SupplierDto entity) => entity.Id;
}

public sealed class CustomerRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<CustomerDto>(store, currentUser), ICustomerRepository
{
    protected override string EntityType => "CUSTOMER";
    protected override string GetId(CustomerDto entity) => entity.Id;
}

public sealed class OrderRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<OrderDto>(store, currentUser), IOrderRepository
{
    protected override string EntityType => "ORDER";
    protected override string GetId(OrderDto entity) => entity.Id;
}

public sealed class InboundRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<InboundDto>(store, currentUser), IInboundRepository
{
    protected override string EntityType => "INBOUND";
    protected override string GetId(InboundDto entity) => entity.Id;
}

public sealed class ReturnRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<ReturnDto>(store, currentUser), IReturnRepository
{
    protected override string EntityType => "RETURN";
    protected override string GetId(ReturnDto entity) => entity.Id;
}

public sealed class ApprovalRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<ApprovalRequestDto>(store, currentUser), IApprovalRepository
{
    protected override string EntityType => "APPROVAL";
    protected override string GetId(ApprovalRequestDto entity) => entity.Id;
}

public sealed class ApprovalLogRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<ApprovalLogDto>(store, currentUser), IApprovalLogRepository
{
    protected override string EntityType => "AUDIT";
    protected override string GetId(ApprovalLogDto entity) => entity.Id;
}

public sealed class UserProfileRepository(IDocumentStore store, ICurrentUser currentUser)
    : DocumentRepository<UserProfileDto>(store, currentUser), IUserProfileRepository
{
    protected override string EntityType => "PROFILE";
    protected override string GetId(UserProfileDto entity) => entity.UserId;
}

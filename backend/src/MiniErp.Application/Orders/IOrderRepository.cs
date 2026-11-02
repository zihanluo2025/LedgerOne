using MiniErp.Application.Abstractions;
using MiniErp.Application.Orders.Models;

namespace MiniErp.Application.Orders;

public interface IOrderRepository : IEntityRepository<OrderDto>;

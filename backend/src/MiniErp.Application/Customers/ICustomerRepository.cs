using MiniErp.Application.Abstractions;
using MiniErp.Application.Customers.Models;

namespace MiniErp.Application.Customers;

public interface ICustomerRepository : IEntityRepository<CustomerDto>;

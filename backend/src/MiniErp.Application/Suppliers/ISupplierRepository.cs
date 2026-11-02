using MiniErp.Application.Abstractions;
using MiniErp.Application.Suppliers.Models;

namespace MiniErp.Application.Suppliers;

public interface ISupplierRepository : IEntityRepository<SupplierDto>;

using MiniErp.Application.Abstractions;
using MiniErp.Application.Inbounds.Models;

namespace MiniErp.Application.Inbounds;

public interface IInboundRepository : IEntityRepository<InboundDto>;

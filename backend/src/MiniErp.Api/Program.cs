using MiniErp.Application.Abstractions;
using MiniErp.Application.Products;
using MiniErp.Application.Users;
using MiniErp.Domain.Auth;
using MiniErp.Infrastructure.Common;
using MiniErp.Infrastructure.Products;
using MiniErp.Infrastructure.Users;
using Amazon.DynamoDBv2;
using Amazon.Lambda.AspNetCoreServer.Hosting;
using Amazon.CognitoIdentityProvider;

var builder = WebApplication.CreateBuilder(args);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);
// CORS
// CORS (Lambda/API Gateway friendly)
var corsRaw = builder.Configuration["CORS_ALLOWED_ORIGINS"] ?? "";
var allowedOrigins = corsRaw
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (allowedOrigins.Length == 0)
            allowedOrigins = new[] { "http://localhost:3000" };

        policy.WithOrigins(allowedOrigins)
              .WithHeaders("Content-Type", "Authorization") 
              .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    });
});

// DI
builder.Services.AddHttpContextAccessor();

// 临时 CurrentUser（后面接 Cognito 会替换掉）
builder.Services.AddScoped<ICurrentUser>(_ => new LocalCurrentUser());

// Clock + Repo + Service
builder.Services.AddSingleton<IClock, SystemClock>();

var useDdb = builder.Configuration.GetValue<bool>("UseDynamoDb");

if (useDdb)
{
    builder.Services.AddAWSService<IAmazonDynamoDB>();
    builder.Services.AddSingleton<IProductRepository>(sp =>
        new DynamoDbProductRepository(
            sp.GetRequiredService<IAmazonDynamoDB>(),
            builder.Configuration["DynamoDb:TableName"] ?? "MiniErp"
        ));
}
else
{
    builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();
}

// Cognito user directory
builder.Services.AddAWSService<IAmazonCognitoIdentityProvider>();
builder.Services.AddSingleton<IUserDirectory, CognitoUserDirectory>();

builder.Services.AddScoped<ProductService>();

var app = builder.Build();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.MapGet("/me", (ICurrentUser user) => Results.Ok(new
{
    userId = user.UserId,
    email = user.Email,
    role = user.Role.ToString(),
    orgId = user.OrgId
}));

app.MapPost("/products", async (MiniErp.Application.Products.Models.CreateProductRequest req, ProductService svc, CancellationToken ct) =>
{
    var id = await svc.CreateAsync(req, ct);
    return Results.Created($"/products/{id}", new { id });
});

app.MapGet("/products/{id}", async (string id, ProductService svc, CancellationToken ct) =>
{
    var product = await svc.GetAsync(id, ct);
    return product is null ? Results.NotFound() : Results.Ok(product);
});

app.MapGet("/products", async (string? keyword, int? limit, string? cursor, ProductService svc, CancellationToken ct) =>
{
    var data = await svc.ListAsync(keyword, limit ?? 50, cursor, ct);
    return Results.Ok(new { items = data });
});
// page list with cursor-based pagination
app.MapGet("/products/page", async (string? keyword, int? limit, string? cursor, ProductService svc, ICurrentUser user, CancellationToken ct) =>
{
    var page = await svc.PageListAsync(user.OrgId, keyword, limit ?? 50, cursor, ct);
    return Results.Ok(new { items = page.Items, nextCursor = page.NextCursor });
});
app.MapPut("/products/{id}", async (
    string id,
    MiniErp.Application.Products.Models.UpdateProductRequest req,
    ProductService svc,
    CancellationToken ct) =>
{
    await svc.UpdateAsync(id, req, ct);
    return Results.NoContent();
});

app.MapDelete("/products/{id}", async (
    string id,
    ProductService svc,
    CancellationToken ct) =>
{
    await svc.SoftDeleteAsync(id, ct);
    return Results.NoContent();
});

// Users (Cognito-backed)
app.MapGet("/users", async (
    string? keyword,
    int? limit,
    string? cursor,
    IUserDirectory users,
    CancellationToken ct) =>
{
    var page = await users.ListAsync(keyword, limit ?? 50, cursor, ct);
    return Results.Ok(new { items = page.Items, nextCursor = page.NextCursor });
});

app.MapPost("/users", async (
    CreateUserRequest req,
    IUserDirectory users,
    CancellationToken ct) =>
{
    var id = await users.CreateAsync(req, ct);
    return Results.Created($"/users/{id}", new { id });
});

app.MapPut("/users/{id}", async (
    string id,
    UpdateUserRequest req,
    IUserDirectory users,
    CancellationToken ct) =>
{
    await users.UpdateAsync(id, req, ct);
    return Results.NoContent();
});

app.MapDelete("/users/{id}", async (
    string id,
    IUserDirectory users,
    CancellationToken ct) =>
{
    await users.DeleteAsync(id, ct);
    return Results.NoContent();
});

app.Run();

sealed class LocalCurrentUser : ICurrentUser
{
    public string UserId => "local-user";
    public string Email => "local@example.com";
    public string OrgId => "demo-org";
    public Role Role => Role.Admin;
}
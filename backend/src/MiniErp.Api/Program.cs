using System.Text.Json.Serialization;
using Amazon.CognitoIdentityProvider;
using Amazon.DynamoDBv2;
using MiniErp.Api.Auth;
using MiniErp.Api.Middleware;
using MiniErp.Application.Abstractions;
using MiniErp.Application.Approvals;
using MiniErp.Application.Customers;
using MiniErp.Application.Dashboard;
using MiniErp.Application.Inbounds;
using MiniErp.Application.Orders;
using MiniErp.Application.Products;
using MiniErp.Application.Returns;
using MiniErp.Application.Suppliers;
using MiniErp.Application.Users;
using MiniErp.Infrastructure.Common;
using MiniErp.Infrastructure.Persistence;
using MiniErp.Infrastructure.Products;
using MiniErp.Infrastructure.Users;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Enums travel as strings, e.g. "Active", "Pending".
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// CORS (Lambda/API Gateway friendly)
var allowedOrigins = (builder.Configuration["CORS_ALLOWED_ORIGINS"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

if (allowedOrigins.Length == 0)
    allowedOrigins = ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .WithHeaders("Content-Type", "Authorization")
              .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    });
});

// Identity
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpContextCurrentUser>();
builder.Services.AddSingleton<IClock, SystemClock>();

// Persistence: DynamoDB single table in the cloud, in-memory store for local runs.
var useDdb = builder.Configuration.GetValue<bool>("UseDynamoDb");
var tableName = builder.Configuration["DynamoDb:TableName"] ?? "MiniErp";

if (useDdb)
{
    builder.Services.AddAWSService<IAmazonDynamoDB>();
    builder.Services.AddSingleton<IDocumentStore>(sp =>
        new DynamoDbDocumentStore(sp.GetRequiredService<IAmazonDynamoDB>(), tableName));
    builder.Services.AddSingleton<IProductRepository>(sp =>
        new DynamoDbProductRepository(sp.GetRequiredService<IAmazonDynamoDB>(), tableName));
}
else
{
    builder.Services.AddSingleton<IDocumentStore, InMemoryDocumentStore>();
    builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();
}

builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IInboundRepository, InboundRepository>();
builder.Services.AddScoped<IReturnRepository, ReturnRepository>();
builder.Services.AddScoped<IApprovalRepository, ApprovalRepository>();
builder.Services.AddScoped<IApprovalLogRepository, ApprovalLogRepository>();

// Application services
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<InboundService>();
builder.Services.AddScoped<ReturnService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<ApprovalService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<IApprovalDocumentHandler, OrderApprovalHandler>();
builder.Services.AddScoped<IApprovalDocumentHandler, InboundApprovalHandler>();

// Cognito user directory
builder.Services.AddAWSService<IAmazonCognitoIdentityProvider>();
builder.Services.AddSingleton<IUserDirectory, CognitoUserDirectory>();

var app = builder.Build();

app.UseMiddleware<ApiExceptionMiddleware>();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.MapGet("/me", (ICurrentUser user) => Results.Ok(new
{
    userId = user.UserId,
    email = user.Email,
    displayName = user.DisplayName,
    role = user.Role.ToString(),
    orgId = user.OrgId
}));

app.Run();

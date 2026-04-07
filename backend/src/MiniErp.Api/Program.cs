using MiniErp.Application.Abstractions;
using MiniErp.Application.Products;
using MiniErp.Application.Users;
using MiniErp.Application.Suppliers;
using MiniErp.Application.Customers;
using MiniErp.Application.Inbounds;

using MiniErp.Domain.Auth;
using MiniErp.Infrastructure.Common;
using MiniErp.Infrastructure.Products;
using MiniErp.Infrastructure.Users;
using MiniErp.Infrastructure.Suppliers;
using MiniErp.Infrastructure.Customers;
using MiniErp.Infrastructure.Inbounds;

using Amazon.DynamoDBv2;
// using Amazon.Lambda.AspNetCoreServer.Hosting;
using Amazon.CognitoIdentityProvider;
using System.Text.Json.Serialization;



var builder = WebApplication.CreateBuilder(args);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

builder.Services.AddControllers();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<InboundService>();

builder.Services.AddScoped<ISupplierRepository, SupplierRepository>();
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<IUserDirectory, CognitoUserDirectory>();

builder.Services.AddScoped<IInboundRepository, InboundRepository>();



builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Allow enums to be sent/received as strings, e.g. "Active"
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
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



var app = builder.Build();
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
    role = user.Role.ToString(),
    orgId = user.OrgId
}));




app.Run();

sealed class LocalCurrentUser : ICurrentUser
{
    public string UserId => "local-user";
    public string Email => "local@example.com";
    public string OrgId => "demo-org";
    public Role Role => Role.Admin;
}
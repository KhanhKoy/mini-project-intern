using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using MiniShopApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseLowerCaseNamingConvention());

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Tránh lỗi vòng lặp tuần hoàn khi serialize đối tượng có navigation property (Product <-> Category)
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

// DEBUG: Kiểm tra connection string và data thực
app.MapGet("/debug/info", async (AppDbContext db, IConfiguration config) => {
    var connStr = config.GetConnectionString("DefaultConnection");
    var canConnect = await db.Database.CanConnectAsync();
    var userCount = await db.Users.AsNoTracking().CountAsync();
    var productCount = await db.Products.AsNoTracking().CountAsync();
    var orderCount = await db.Orders.AsNoTracking().CountAsync();

    return Results.Ok(new {
        ConnectionString = connStr?.Replace("Password=", "Password=***"),
        CanConnect = canConnect,
        Counts = new { Users = userCount, Products = productCount, Orders = orderCount }
    });
});

app.Run();

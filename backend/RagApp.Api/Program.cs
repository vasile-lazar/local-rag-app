using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RagApp.BusinessLayer;
using RagApp.BusinessLayer.Structure;
using RagApp.DataAccess.Context;

DotNetEnv.Env.Load();

var builder = WebApplication.CreateBuilder(args);

var secret = Environment.GetEnvironmentVariable("JWT_SECRET")
             ?? throw new Exception("JWT_SECRET missing");

var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "ragapp";
var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "ragapp";

builder.Services.AddControllers();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = issuer,
            ValidAudience = audience,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secret))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<BusinessLogic>();

builder.Services.AddHttpClient<BusinessLogic>(client =>
{
    var pythonServiceUrl =
        builder.Configuration["PythonServiceUrl"]
        ?? "http://localhost:8000/";

    client.BaseAddress = new Uri(pythonServiceUrl);
});


builder.Services.AddDbContext<RagAppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
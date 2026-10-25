using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Ranum.Api.Auth;
using Ranum.Api.Data;
using Ranum.Api.Models;
using Ranum.Api.Routes;
using Ranum.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
// Validates DataAnnotations on request DTOs and answers 400 with the field errors
builder.Services.AddValidation();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlite(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddSingleton<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();
builder.Services.AddSingleton<AvatarCatalog>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        // Strict SameSite blocks cross-site requests from carrying the cookie (CSRF)
        o.Cookie.SameSite = SameSiteMode.Strict;
        // API: answer 401/403 instead of redirecting to a login page
        o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
        o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
    });
builder.Services.AddAuthorizationBuilder().AddRanumPolicies();

var app = builder.Build();

DbSeeder.Seed(app.Services, app.Configuration);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(app.Services.GetRequiredService<AvatarCatalog>().Directory),
    RequestPath = "/api/avatars",
});

app.UseAuthentication();
app.UseAuthorization();

app.MapApiRoutes();

app.Run();

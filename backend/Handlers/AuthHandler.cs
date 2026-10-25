using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Data;
using Ranum.Api.Dtos.Requests;
using Ranum.Api.Dtos.Responses;
using Ranum.Api.Http;
using Ranum.Api.Models;

namespace Ranum.Api.Handlers;

public static class AuthHandler
{
    public static async Task<IResult> Login(LoginRequest req, AppDbContext db, IPasswordHasher<AppUser> hasher, HttpContext http)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Username == req.Username);
        if (user is null || hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password) == PasswordVerificationResult.Failed)
            return ApiResults.Unauthorized("Username atau password salah");

        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, user.Role.ToString()),
        ];
        await http.SignInAsync(new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
        return Results.Ok(UserResponse.From(user));
    }

    public static async Task<IResult> Logout(HttpContext http)
    {
        await http.SignOutAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> Me(ClaimsPrincipal principal, AppDbContext db)
    {
        var user = await db.CurrentUserAsync(principal);
        return user is null ? Results.Unauthorized() : Results.Ok(UserResponse.From(user));
    }

    public static async Task<IResult> ChangePassword(ChangePasswordRequest req, ClaimsPrincipal principal, AppDbContext db, IPasswordHasher<AppUser> hasher)
    {
        var user = await db.CurrentUserAsync(principal);
        if (user is null)
            return Results.Unauthorized();
        if (hasher.VerifyHashedPassword(user, user.PasswordHash, req.CurrentPassword) == PasswordVerificationResult.Failed)
            return ApiResults.BadRequest("Password lama salah");

        user.PasswordHash = hasher.HashPassword(user, req.NewPassword);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}

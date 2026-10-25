using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Auth;
using Ranum.Api.Data;
using Ranum.Api.Dtos.Requests;
using Ranum.Api.Dtos.Responses;
using Ranum.Api.Http;
using Ranum.Api.Models;

namespace Ranum.Api.Handlers;

public static class UsersHandler
{
    // Admin sees everyone, Guru only sees Siswa
    public static async Task<IResult> List(ClaimsPrincipal principal, AppDbContext db)
    {
        var query = db.Users.AsQueryable();
        if (!principal.IsAdmin())
            query = query.Where(u => u.Role == Role.Siswa);
        var users = await query.OrderBy(u => u.Username).ToListAsync();
        return Results.Ok(users.Select(UserResponse.From));
    }

    // Admin can create Guru or Siswa, Guru only Siswa; nobody creates an Admin through the API
    public static async Task<IResult> Create(CreateUserRequest req, ClaimsPrincipal principal, AppDbContext db, IPasswordHasher<AppUser> hasher)
    {
        var allowed = principal.IsAdmin() ? req.Role is Role.Guru or Role.Siswa : req.Role == Role.Siswa;
        if (!allowed)
            return Results.Forbid();
        if (req.Role == Role.Siswa && req.Kelas is null)
            return ApiResults.BadRequest("Kelas wajib diisi untuk siswa");
        if (await db.Users.AnyAsync(u => u.Username == req.Username))
            return ApiResults.Conflict("Username sudah dipakai");

        var user = new AppUser
        {
            Username = req.Username,
            Role = req.Role,
            Kelas = req.Role == Role.Siswa ? req.Kelas : null,
        };
        user.PasswordHash = hasher.HashPassword(user, req.Password);
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Results.Created($"/api/users/{user.Id}", UserResponse.From(user));
    }
}

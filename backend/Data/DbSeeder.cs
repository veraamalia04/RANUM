using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Models;

namespace Ranum.Api.Data;

// Kelas needs a default: the config binder skips records whose constructor parameters are missing
public record SeedAccount(string Username, string Password, Role Role, int? Kelas = null);

public static class DbSeeder
{
    // Applies pending migrations, then creates the accounts listed under Seed:Accounts that don't exist yet
    public static void Seed(IServiceProvider services, IConfiguration config)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<AppUser>>();

        db.Database.Migrate();

        foreach (var account in config.GetSection("Seed:Accounts").Get<SeedAccount[]>() ?? [])
        {
            if (db.Users.Any(u => u.Username == account.Username))
                continue;
            var user = new AppUser { Username = account.Username, Role = account.Role, Kelas = account.Kelas };
            user.PasswordHash = hasher.HashPassword(user, account.Password);
            db.Users.Add(user);
        }
        db.SaveChanges();

        if (!db.Users.Any(u => u.Role == Role.Admin))
            throw new InvalidOperationException("No admin account: add one under Seed:Accounts in configuration");
    }
}

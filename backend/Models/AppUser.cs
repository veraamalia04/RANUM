namespace Ranum.Api.Models;

public enum Role { Siswa, Guru, Admin }

// Named AppUser (not User) so it never gets confused with the signed-in ClaimsPrincipal
public class AppUser
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public string PasswordHash { get; set; } = "";
    public Role Role { get; set; }
    public int? Kelas { get; set; }

    // Profile, filled in by the user themselves (all required, see UpdateProfileRequest)
    public string? Avatar { get; set; }
    public string? Mood { get; set; }
    public string? Bio { get; set; }
    public string? BirthPlace { get; set; }
    public DateOnly? BirthDate { get; set; }

    // Get-only, so EF doesn't map it to a column
    public bool IsProfileComplete =>
        Avatar is not null && Mood is not null && Bio is not null && BirthPlace is not null && BirthDate is not null;
}

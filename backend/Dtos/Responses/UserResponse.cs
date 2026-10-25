using Ranum.Api.Models;

namespace Ranum.Api.Dtos.Responses;

public record UserResponse(
    int Id, string Username, Role Role, int? Kelas,
    string? Avatar, string? Mood, string? Bio, string? BirthPlace, DateOnly? BirthDate,
    bool ProfileComplete)
{
    public static UserResponse From(AppUser u) =>
        new(u.Id, u.Username, u.Role, u.Kelas, u.Avatar, u.Mood, u.Bio, u.BirthPlace, u.BirthDate, u.IsProfileComplete);
}

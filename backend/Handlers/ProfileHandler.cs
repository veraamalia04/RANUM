using System.Security.Claims;
using Ranum.Api.Data;
using Ranum.Api.Dtos.Requests;
using Ranum.Api.Dtos.Responses;
using Ranum.Api.Http;
using Ranum.Api.Services;

namespace Ranum.Api.Handlers;

public static class ProfileHandler
{
    public static IResult Avatars(AvatarCatalog avatars) => Results.Ok(avatars.Names);

    public static async Task<IResult> Update(UpdateProfileRequest req, ClaimsPrincipal principal, AppDbContext db, AvatarCatalog avatars)
    {
        if (!avatars.Exists(req.Avatar))
            return ApiResults.BadRequest("Avatar tidak tersedia");
        if (req.BirthDate > DateOnly.FromDateTime(DateTime.Today))
            return ApiResults.BadRequest("Tanggal lahir tidak boleh di masa depan");
        var user = await db.CurrentUserAsync(principal);
        if (user is null)
            return Results.Unauthorized();

        user.Avatar = req.Avatar;
        user.Mood = req.Mood;
        user.Bio = req.Bio.Trim();
        user.BirthPlace = req.BirthPlace.Trim();
        user.BirthDate = req.BirthDate;
        await db.SaveChangesAsync();
        return Results.Ok(UserResponse.From(user));
    }
}

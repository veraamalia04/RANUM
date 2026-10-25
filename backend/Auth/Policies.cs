using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Ranum.Api.Models;

namespace Ranum.Api.Auth;

public static class Policies
{
    public const string Staff = "Staff";
    public const string Siswa = "Siswa";

    public static AuthorizationBuilder AddRanumPolicies(this AuthorizationBuilder auth) => auth
        .AddPolicy(Staff, p => p.RequireRole(nameof(Role.Guru), nameof(Role.Admin)))
        .AddPolicy(Siswa, p => p.RequireRole(nameof(Role.Siswa)));
}

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal) =>
        int.Parse(principal.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public static bool IsAdmin(this ClaimsPrincipal principal) => principal.IsInRole(nameof(Role.Admin));
    public static bool IsSiswa(this ClaimsPrincipal principal) => principal.IsInRole(nameof(Role.Siswa));
}

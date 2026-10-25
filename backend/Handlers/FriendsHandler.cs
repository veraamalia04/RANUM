using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Auth;
using Ranum.Api.Data;
using Ranum.Api.Dtos.Responses;
using Ranum.Api.Http;
using Ranum.Api.Models;

namespace Ranum.Api.Handlers;

// Siswa befriend other Siswa (any kelas); the other side has to accept
public static class FriendsHandler
{
    public static async Task<IResult> List(ClaimsPrincipal principal, AppDbContext db)
    {
        var me = principal.GetUserId();
        var rows = await db.Friendships.Include(f => f.Requester).Include(f => f.Addressee)
            .Where(f => f.RequesterId == me || f.AddresseeId == me)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

        PublicProfileResponse Other(Friendship f) => PublicProfileResponse.From(f.RequesterId == me ? f.Addressee! : f.Requester!);
        return Results.Ok(new FriendsResponse(
            rows.Where(f => f.Status == FriendStatus.Accepted).Select(Other).OrderBy(u => u.Username).ToList(),
            rows.Where(f => f.Status == FriendStatus.Pending && f.AddresseeId == me).Select(Other).ToList(),
            rows.Where(f => f.Status == FriendStatus.Pending && f.RequesterId == me).Select(Other).ToList()));
    }

    // Siswa whose username matches q; an empty q lists the caller's classmates
    public static async Task<IResult> Search(string? q, ClaimsPrincipal principal, AppDbContext db)
    {
        var me = await db.CurrentUserAsync(principal);
        if (me is null)
            return Results.Unauthorized();

        var query = db.Users.Where(u => u.Role == Role.Siswa && u.Id != me.Id);
        query = string.IsNullOrWhiteSpace(q)
            ? query.Where(u => u.Kelas == me.Kelas)
            : query.Where(u => EF.Functions.Like(u.Username, $"%{q.Trim()}%"));
        var users = await query.OrderBy(u => u.Username).Take(20).ToListAsync();

        var rows = await db.Friendships.Where(f => f.RequesterId == me.Id || f.AddresseeId == me.Id).ToListAsync();
        return Results.Ok(users.Select(u => new FriendSearchResponse(PublicProfileResponse.From(u), StateOf(rows.Find(f => Involves(f, me.Id, u.Id)), me.Id))));
    }

    // Sends a request, or accepts right away when the other side already asked
    public static async Task<IResult> Send(int userId, ClaimsPrincipal principal, AppDbContext db)
    {
        var me = principal.GetUserId();
        var target = await db.Users.FindAsync(userId);
        if (target is null)
            return Results.NotFound();
        if (target.Role != Role.Siswa || target.Id == me)
            return ApiResults.BadRequest("Kamu hanya bisa berteman dengan siswa lain");

        var existing = await Find(db, me, userId);
        if (existing is null)
        {
            db.Friendships.Add(new Friendship { RequesterId = me, AddresseeId = userId, Status = FriendStatus.Pending, CreatedAt = DateTime.UtcNow });
            await db.SaveChangesAsync();
            return Results.Created($"/api/friends/{userId}", new FriendStateResponse(FriendState.Outgoing));
        }
        if (existing.Status == FriendStatus.Accepted)
            return ApiResults.Conflict("Kalian sudah berteman");
        if (existing.RequesterId == me)
            return ApiResults.Conflict("Permintaan pertemanan sudah dikirim");

        existing.Status = FriendStatus.Accepted;
        await db.SaveChangesAsync();
        return Results.Ok(new FriendStateResponse(FriendState.Friends));
    }

    // Only the one who received the request can accept it
    public static async Task<IResult> Accept(int userId, ClaimsPrincipal principal, AppDbContext db)
    {
        var me = principal.GetUserId();
        var request = await db.Friendships.FirstOrDefaultAsync(f =>
            f.RequesterId == userId && f.AddresseeId == me && f.Status == FriendStatus.Pending);
        if (request is null)
            return Results.NotFound();

        request.Status = FriendStatus.Accepted;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    // Reject, cancel or unfriend: all three just remove the row
    public static async Task<IResult> Remove(int userId, ClaimsPrincipal principal, AppDbContext db)
    {
        var existing = await Find(db, principal.GetUserId(), userId);
        if (existing is null)
            return Results.NotFound();

        db.Friendships.Remove(existing);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> Profile(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null || !await Visibility.CanSeeUserAsync(principal, user, db))
            return Results.NotFound();
        return Results.Ok(PublicProfileResponse.From(user));
    }

    private static Task<Friendship?> Find(AppDbContext db, int a, int b) =>
        db.Friendships.FirstOrDefaultAsync(f => (f.RequesterId == a && f.AddresseeId == b) || (f.RequesterId == b && f.AddresseeId == a));

    private static bool Involves(Friendship f, int a, int b) =>
        (f.RequesterId == a && f.AddresseeId == b) || (f.RequesterId == b && f.AddresseeId == a);

    private static FriendState StateOf(Friendship? f, int me) => f switch
    {
        null => FriendState.None,
        { Status: FriendStatus.Accepted } => FriendState.Friends,
        _ when f.RequesterId == me => FriendState.Outgoing,
        _ => FriendState.Incoming,
    };
}

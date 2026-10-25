using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Auth;
using Ranum.Api.Data;
using Ranum.Api.Models;

namespace Ranum.Api.Handlers;

// Who may see whom, shared by friends, posts and portfolio
public static class Visibility
{
    // Ids of the user's accepted friends, as a subquery EF can compose into other queries
    public static IQueryable<int> FriendIds(AppDbContext db, int userId) =>
        db.Friendships.Where(f => f.Status == FriendStatus.Accepted && f.RequesterId == userId).Select(f => f.AddresseeId)
            .Concat(db.Friendships.Where(f => f.Status == FriendStatus.Accepted && f.AddresseeId == userId).Select(f => f.RequesterId));

    public static Task<bool> AreFriendsAsync(AppDbContext db, int a, int b) =>
        db.Friendships.AnyAsync(f => f.Status == FriendStatus.Accepted
            && ((f.RequesterId == a && f.AddresseeId == b) || (f.RequesterId == b && f.AddresseeId == a)));

    // Staff see everyone and everyone sees staff; a Siswa sees themselves, their kelas and their friends
    public static async Task<bool> CanSeeUserAsync(ClaimsPrincipal principal, AppUser target, AppDbContext db)
    {
        if (!principal.IsSiswa() || target.Role != Role.Siswa)
            return true;
        var me = await db.CurrentUserAsync(principal);
        return me is not null && (me.Id == target.Id || me.Kelas == target.Kelas || await AreFriendsAsync(db, me.Id, target.Id));
    }

    // Posts a Siswa may see: their kelas, staff posts (Kelas == null), their own and their friends'
    public static async Task<IQueryable<Post>> VisiblePostsAsync(ClaimsPrincipal principal, AppDbContext db)
    {
        if (!principal.IsSiswa())
            return db.Posts;
        var me = await db.CurrentUserAsync(principal);
        var friends = FriendIds(db, me!.Id);
        return db.Posts.Where(p => p.Kelas == null || p.Kelas == me.Kelas || p.AuthorId == me.Id || friends.Contains(p.AuthorId));
    }

    // Authors and staff can delete posts, comments and portfolio items
    public static bool CanDelete(ClaimsPrincipal principal, int ownerId) =>
        !principal.IsSiswa() || ownerId == principal.GetUserId();
}

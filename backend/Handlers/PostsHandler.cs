using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Auth;
using Ranum.Api.Data;
using Ranum.Api.Dtos.Requests;
using Ranum.Api.Dtos.Responses;
using Ranum.Api.Http;
using Ranum.Api.Models;
using Ranum.Api.Validation;

namespace Ranum.Api.Handlers;

// Karya on the Jelajah feed. No likes on purpose, only comments.
public static class PostsHandler
{
    // shortcut: newest 50 only, add paging when a feed outgrows that
    // ?category=Seni&category=Musik keeps karya with any of those categories
    public static async Task<IResult> List(int? kelas, int? authorId, Category[]? category, ClaimsPrincipal principal, AppDbContext db)
    {
        var query = await Visibility.VisiblePostsAsync(principal, db);
        if (kelas is not null && !principal.IsSiswa())
            query = query.Where(p => p.Kelas == kelas);
        if (authorId is not null)
            query = query.Where(p => p.AuthorId == authorId);
        if (category is { Length: > 0 })
            query = query.Where(p => p.Categories.Any(x => category.Contains(x)));

        var me = principal.GetUserId();
        var staff = !principal.IsSiswa();
        // Projected so the image data URLs are never loaded for the list
        var posts = await query.OrderByDescending(p => p.CreatedAt).Take(50).Select(p => new PostResponse(
            p.Id,
            new PublicProfileResponse(p.Author!.Id, p.Author.Username, p.Author.Role, p.Author.Kelas, p.Author.Avatar, p.Author.Mood, p.Author.Bio),
            p.Kelas, p.Text, p.ImageUrl != null, p.Categories, p.CreatedAt, p.Comments.Count,
            staff || p.AuthorId == me
        )).ToListAsync();
        return Results.Ok(posts);
    }

    public static async Task<IResult> Create(CreatePostRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        var text = string.IsNullOrWhiteSpace(req.Text) ? null : req.Text.Trim();
        if (text is null && req.ImageUrl is null)
            return ApiResults.BadRequest("Tulis ceritamu atau pilih foto dulu");
        if (req.ImageUrl is not null && !ImageData.IsJpegDataUrl(req.ImageUrl))
            return ApiResults.BadRequest("Foto harus berupa gambar JPEG");
        var me = await db.CurrentUserAsync(principal);
        if (me is null)
            return Results.Unauthorized();

        var post = new Post
        {
            Author = me, Kelas = me.Kelas, Text = text, ImageUrl = req.ImageUrl,
            Categories = req.Categories?.Distinct().ToList() ?? [], CreatedAt = DateTime.UtcNow,
        };
        db.Posts.Add(post);
        await db.SaveChangesAsync();
        return Results.Created($"/api/posts/{post.Id}",
            new PostResponse(post.Id, PublicProfileResponse.From(me), post.Kelas, post.Text, post.ImageUrl != null, post.Categories, post.CreatedAt, 0, true));
    }

    public static async Task<IResult> Image(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var post = await FindVisible(id, principal, db);
        if (post?.ImageUrl is null)
            return Results.NotFound();
        return Results.File(Convert.FromBase64String(post.ImageUrl[ImageData.JpegPrefix.Length..]), "image/jpeg");
    }

    public static async Task<IResult> Delete(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var post = await FindVisible(id, principal, db);
        if (post is null)
            return Results.NotFound();
        if (!Visibility.CanDelete(principal, post.AuthorId))
            return Results.Forbid();

        db.Posts.Remove(post);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    // Oldest first, like a conversation
    public static async Task<IResult> Comments(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        if (await FindVisible(id, principal, db) is null)
            return Results.NotFound();
        var comments = await db.Comments.Include(c => c.Author).Where(c => c.PostId == id).OrderBy(c => c.CreatedAt).ToListAsync();
        return Results.Ok(comments.Select(c => ToResponse(c, principal)));
    }

    public static async Task<IResult> AddComment(int id, CreateCommentRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return ApiResults.BadRequest("Komentar masih kosong");
        if (await FindVisible(id, principal, db) is null)
            return Results.NotFound();
        var me = await db.CurrentUserAsync(principal);
        if (me is null)
            return Results.Unauthorized();

        var comment = new Comment { PostId = id, Author = me, Text = req.Text.Trim(), CreatedAt = DateTime.UtcNow };
        db.Comments.Add(comment);
        await db.SaveChangesAsync();
        return Results.Created($"/api/posts/{id}/comments/{comment.Id}", ToResponse(comment, principal));
    }

    public static async Task<IResult> DeleteComment(int id, int commentId, ClaimsPrincipal principal, AppDbContext db)
    {
        var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == commentId && c.PostId == id);
        if (comment is null || await FindVisible(id, principal, db) is null)
            return Results.NotFound();
        if (!Visibility.CanDelete(principal, comment.AuthorId))
            return Results.Forbid();

        db.Comments.Remove(comment);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    // A post the caller is not allowed to see is a 404, like a challenge for another kelas
    private static async Task<Post?> FindVisible(int id, ClaimsPrincipal principal, AppDbContext db) =>
        await (await Visibility.VisiblePostsAsync(principal, db)).FirstOrDefaultAsync(p => p.Id == id);

    private static CommentResponse ToResponse(Comment c, ClaimsPrincipal principal) =>
        new(c.Id, PublicProfileResponse.From(c.Author!), c.Text, c.CreatedAt, Visibility.CanDelete(principal, c.AuthorId));
}

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

// A Siswa's portfolio: photos and PDFs, seen by whoever may see their profile
public static class PortfolioHandler
{
    public static async Task<IResult> List(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var owner = await db.Users.FindAsync(id);
        if (owner is null || !await Visibility.CanSeeUserAsync(principal, owner, db))
            return Results.NotFound();

        var canDelete = Visibility.CanDelete(principal, id);
        // Projected so the file data URLs are never loaded for the list
        var items = await db.PortfolioItems.Where(p => p.OwnerId == id).OrderByDescending(p => p.CreatedAt)
            .Select(p => new PortfolioResponse(p.Id, p.Title, p.Description,
                p.FileUrl.StartsWith(ImageData.PdfPrefix) ? PortfolioFileType.Pdf : PortfolioFileType.Foto,
                p.CreatedAt, canDelete))
            .ToListAsync();
        return Results.Ok(items);
    }

    public static async Task<IResult> Create(CreatePortfolioRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return ApiResults.BadRequest("Judul masih kosong");
        var isPdf = ImageData.IsPdfDataUrl(req.FileUrl);
        if (!isPdf && !ImageData.IsJpegDataUrl(req.FileUrl))
            return ApiResults.BadRequest("File harus berupa foto JPEG atau PDF (maksimal 5 MB)");

        var item = new PortfolioItem
        {
            OwnerId = principal.GetUserId(),
            Title = req.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            FileUrl = req.FileUrl,
            CreatedAt = DateTime.UtcNow,
        };
        db.PortfolioItems.Add(item);
        await db.SaveChangesAsync();
        return Results.Created($"/api/portfolio/{item.Id}", new PortfolioResponse(
            item.Id, item.Title, item.Description, isPdf ? PortfolioFileType.Pdf : PortfolioFileType.Foto, item.CreatedAt, true));
    }

    // No download name, so the browser shows the photo or PDF inline
    public static async Task<IResult> File(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var item = await db.PortfolioItems.Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == id);
        if (item is null || !await Visibility.CanSeeUserAsync(principal, item.Owner!, db))
            return Results.NotFound();

        var (prefix, type) = item.FileUrl.StartsWith(ImageData.PdfPrefix)
            ? (ImageData.PdfPrefix, "application/pdf")
            : (ImageData.JpegPrefix, "image/jpeg");
        return Results.File(Convert.FromBase64String(item.FileUrl[prefix.Length..]), type);
    }

    public static async Task<IResult> Delete(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var item = await db.PortfolioItems.Include(p => p.Owner).FirstOrDefaultAsync(p => p.Id == id);
        if (item is null || !await Visibility.CanSeeUserAsync(principal, item.Owner!, db))
            return Results.NotFound();
        if (!Visibility.CanDelete(principal, item.OwnerId))
            return Results.Forbid();

        db.PortfolioItems.Remove(item);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}

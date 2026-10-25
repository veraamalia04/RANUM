using System.ComponentModel.DataAnnotations;
using Ranum.Api.Models;

namespace Ranum.Api.Dtos.Requests;

// Text, a photo, or both (checked in PostsHandler)
public record CreatePostRequest([MaxLength(2000)] string? Text, [MaxLength(3_000_000)] string? ImageUrl, List<Category>? Categories = null);

public record CreateCommentRequest([Required, MaxLength(500)] string Text);

// FileUrl is a JPEG or PDF data URL; 7M chars fits a 5 MB PDF in base64
public record CreatePortfolioRequest(
    [Required, MaxLength(100)] string Title,
    [MaxLength(1000)] string? Description,
    [Required, MaxLength(7_000_000)] string FileUrl);

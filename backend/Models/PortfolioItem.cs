namespace Ranum.Api.Models;

public class PortfolioItem
{
    public int Id { get; set; }
    public int OwnerId { get; set; }
    public AppUser? Owner { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    // JPEG or PDF data URL, served by GET /api/portfolio/{id}/file
    public required string FileUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

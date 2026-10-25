namespace Ranum.Api.Models;

// A karya on the Jelajah feed: text, a photo, or both
public class Post
{
    public int Id { get; set; }
    public int AuthorId { get; set; }
    public AppUser? Author { get; set; }
    // Snapshot of the author's kelas; null = posted by staff, visible to every kelas
    public int? Kelas { get; set; }
    public string? Text { get; set; }
    // JPEG data URL, served by GET /api/posts/{id}/image
    public string? ImageUrl { get; set; }
    public List<Category> Categories { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public List<Comment> Comments { get; set; } = [];
}

public class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int AuthorId { get; set; }
    public AppUser? Author { get; set; }
    public required string Text { get; set; }
    public DateTime CreatedAt { get; set; }
}

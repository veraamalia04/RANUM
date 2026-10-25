using Ranum.Api.Models;

namespace Ranum.Api.Dtos.Responses;

// What other people may see of a user: no birth date or birth place
public record PublicProfileResponse(int Id, string Username, Role Role, int? Kelas, string? Avatar, string? Mood, string? Bio)
{
    public static PublicProfileResponse From(AppUser u) => new(u.Id, u.Username, u.Role, u.Kelas, u.Avatar, u.Mood, u.Bio);
}

public enum FriendState { None, Friends, Incoming, Outgoing }

public record FriendsResponse(
    List<PublicProfileResponse> Friends, List<PublicProfileResponse> Incoming, List<PublicProfileResponse> Outgoing);

public record FriendSearchResponse(PublicProfileResponse User, FriendState State);

public record FriendStateResponse(FriendState State);

public record PostResponse(
    int Id, PublicProfileResponse Author, int? Kelas, string? Text, bool HasImage, List<Category> Categories, DateTime CreatedAt, int CommentCount, bool CanDelete);

public record CommentResponse(int Id, PublicProfileResponse Author, string Text, DateTime CreatedAt, bool CanDelete);

public enum PortfolioFileType { Foto, Pdf }

public record PortfolioResponse(
    int Id, string Title, string? Description, PortfolioFileType FileType, DateTime CreatedAt, bool CanDelete);

namespace Ranum.Api.Models;

public enum FriendStatus { Pending, Accepted }

// RequesterId asked AddresseeId; one row per pair (FriendsHandler checks the reverse direction)
public class Friendship
{
    public int Id { get; set; }
    public int RequesterId { get; set; }
    public AppUser? Requester { get; set; }
    public int AddresseeId { get; set; }
    public AppUser? Addressee { get; set; }
    public FriendStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

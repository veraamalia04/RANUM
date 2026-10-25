using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Auth;
using Ranum.Api.Models;

namespace Ranum.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<ChallengeDraft> ChallengeDrafts => Set<ChallengeDraft>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();

    public ValueTask<AppUser?> CurrentUserAsync(ClaimsPrincipal principal) => Users.FindAsync(principal.GetUserId());

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>().HasIndex(u => u.Username).IsUnique();
        modelBuilder.Entity<AppUser>().Property(u => u.Role).HasConversion<string>();
        modelBuilder.Entity<Question>().Property(q => q.Type).HasConversion<string>();
        // Category lists are JSON arrays of names, e.g. ["Seni","Musik"]
        modelBuilder.Entity<Challenge>().PrimitiveCollection(c => c.Categories).ElementType().HasConversion<string>();
        modelBuilder.Entity<Post>().PrimitiveCollection(p => p.Categories).ElementType().HasConversion<string>();
        modelBuilder.Entity<ChallengeDraft>().HasIndex(d => new { d.ChallengeId, d.StudentId }).IsUnique();
        // One submission per student per challenge
        modelBuilder.Entity<Submission>().HasIndex(s => new { s.ChallengeId, s.StudentId }).IsUnique();
        modelBuilder.Entity<Enrollment>().HasIndex(e => new { e.ChallengeId, e.StudentId }).IsUnique();
        modelBuilder.Entity<Friendship>().HasIndex(f => new { f.RequesterId, f.AddresseeId }).IsUnique();
        modelBuilder.Entity<Friendship>().Property(f => f.Status).HasConversion<string>();
        modelBuilder.Entity<Post>().HasIndex(p => p.CreatedAt);
    }
}

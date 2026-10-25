using Ranum.Api.Auth;
using Ranum.Api.Handlers;

namespace Ranum.Api.Routes;

// Every API endpoint, in one place. Handlers live in Handlers/, request/response shapes in Dtos/.
public static class Api
{
    public static void MapApiRoutes(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api");

        var auth = api.MapGroup("/auth");
        auth.MapPost("/login", AuthHandler.Login);
        // Cast: an (HttpContext) => Task<IResult> handler would otherwise bind as a RequestDelegate and drop its result
        auth.MapPost("/logout", (Delegate)AuthHandler.Logout).RequireAuthorization();
        auth.MapGet("/me", AuthHandler.Me).RequireAuthorization();
        auth.MapPut("/me", ProfileHandler.Update).RequireAuthorization();
        auth.MapPut("/password", AuthHandler.ChangePassword).RequireAuthorization();

        // The image files themselves are served as static files from /api/avatars/{name} (see Program.cs)
        api.MapGet("/avatars", ProfileHandler.Avatars).RequireAuthorization();

        var users = api.MapGroup("/users").RequireAuthorization(Policies.Staff);
        users.MapGet("", UsersHandler.List);
        users.MapPost("", UsersHandler.Create);

        var challenges = api.MapGroup("/challenges").RequireAuthorization();
        challenges.MapGet("", ChallengesHandler.List);
        challenges.MapPost("", ChallengesHandler.Create).RequireAuthorization(Policies.Staff);
        challenges.MapGet("/my-results", ChallengesHandler.MyResults).RequireAuthorization(Policies.Siswa);
        challenges.MapGet("/{id:int}", ChallengesHandler.Get);
        challenges.MapDelete("/{id:int}", ChallengesHandler.Delete).RequireAuthorization(Policies.Staff);
        challenges.MapGet("/{id:int}/poster", ChallengesHandler.Poster);
        challenges.MapPost("/{id:int}/accept", ChallengesHandler.Accept).RequireAuthorization(Policies.Siswa);
        challenges.MapPost("/{id:int}/submissions", ChallengesHandler.Submit).RequireAuthorization(Policies.Siswa);
        challenges.MapGet("/{id:int}/draft", ChallengesHandler.GetDraft).RequireAuthorization(Policies.Siswa);
        challenges.MapPut("/{id:int}/draft", ChallengesHandler.SaveDraft).RequireAuthorization(Policies.Siswa);
        challenges.MapGet("/{id:int}/submissions", ChallengesHandler.Submissions).RequireAuthorization(Policies.Staff);
        challenges.MapPut("/{id:int}/submissions/{submissionId:int}/grade", ChallengesHandler.Grade).RequireAuthorization(Policies.Staff);

        // Outside the Staff-only /users group: anyone may open a profile they are allowed to see (see Visibility)
        api.MapGet("/users/{id:int}/profile", FriendsHandler.Profile).RequireAuthorization();
        api.MapGet("/users/{id:int}/portfolio", PortfolioHandler.List).RequireAuthorization();

        var friends = api.MapGroup("/friends").RequireAuthorization(Policies.Siswa);
        friends.MapGet("", FriendsHandler.List);
        friends.MapGet("/search", FriendsHandler.Search);
        friends.MapPost("/{userId:int}", FriendsHandler.Send);
        friends.MapPost("/{userId:int}/accept", FriendsHandler.Accept);
        friends.MapDelete("/{userId:int}", FriendsHandler.Remove);

        var posts = api.MapGroup("/posts").RequireAuthorization();
        posts.MapGet("", PostsHandler.List);
        posts.MapPost("", PostsHandler.Create);
        posts.MapGet("/{id:int}/image", PostsHandler.Image);
        posts.MapDelete("/{id:int}", PostsHandler.Delete);
        posts.MapGet("/{id:int}/comments", PostsHandler.Comments);
        posts.MapPost("/{id:int}/comments", PostsHandler.AddComment);
        posts.MapDelete("/{id:int}/comments/{commentId:int}", PostsHandler.DeleteComment);

        var portfolio = api.MapGroup("/portfolio").RequireAuthorization();
        portfolio.MapPost("", PortfolioHandler.Create).RequireAuthorization(Policies.Siswa);
        portfolio.MapGet("/{id:int}/file", PortfolioHandler.File);
        portfolio.MapDelete("/{id:int}", PortfolioHandler.Delete);
    }
}

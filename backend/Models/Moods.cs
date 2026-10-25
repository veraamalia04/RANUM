namespace Ranum.Api.Models;

public static class Moods
{
    // Must match the ids in frontend/src/lib/moods.ts
    public static readonly IReadOnlySet<string> All = new HashSet<string>
    {
        "senang", "gembira", "semangat", "penasaran", "ngantuk", "biasa", "sedih", "marah",
    };
}

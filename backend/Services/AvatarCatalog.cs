namespace Ranum.Api.Services;

// The fixed set of profile pictures in Data/avatars, served at /api/avatars/{name}
public class AvatarCatalog
{
    private static readonly string[] Extensions = [".webp", ".png", ".jpg", ".jpeg"];

    public string Directory { get; }
    public IReadOnlyList<string> Names { get; }

    public AvatarCatalog(IWebHostEnvironment env)
    {
        Directory = Path.Combine(env.ContentRootPath, "Data", "avatars");
        Names = System.IO.Directory.EnumerateFiles(Directory)
            .Where(f => Extensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
            .Select(Path.GetFileName)
            .Order()
            .ToList()!;
    }

    public bool Exists(string name) => Names.Contains(name);
}

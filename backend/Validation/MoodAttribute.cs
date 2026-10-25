using System.ComponentModel.DataAnnotations;
using Ranum.Api.Models;

namespace Ranum.Api.Validation;

public sealed class MoodAttribute() : ValidationAttribute("Mood tidak dikenal")
{
    public override bool IsValid(object? value) => value is null || value is string s && Moods.All.Contains(s);
}

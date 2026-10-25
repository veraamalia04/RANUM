using System.ComponentModel.DataAnnotations;
using Ranum.Api.Validation;

namespace Ranum.Api.Dtos.Requests;

public record LoginRequest([Required] string Username, [Required] string Password);

public record ChangePasswordRequest([Required] string CurrentPassword, [Required, MinLength(6)] string NewPassword);

// Every profile field is required, so a saved profile is always complete
public record UpdateProfileRequest(
    [Required] string Avatar,
    [Required, Mood] string Mood,
    [Required, MaxLength(200)] string Bio,
    [Required, MaxLength(60)] string BirthPlace,
    [Required] DateOnly? BirthDate);

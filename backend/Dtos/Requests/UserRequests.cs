using System.ComponentModel.DataAnnotations;
using Ranum.Api.Models;

namespace Ranum.Api.Dtos.Requests;

public record CreateUserRequest(
    [Required, MinLength(3), MaxLength(30)] string Username,
    [Required, MinLength(6)] string Password,
    Role Role,
    [Range(1, 12)] int? Kelas);

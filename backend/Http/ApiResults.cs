using Ranum.Api.Dtos.Responses;

namespace Ranum.Api.Http;

// Error results with a { message } body the frontend can show as-is
public static class ApiResults
{
    public static IResult BadRequest(string message) => Results.BadRequest(new ErrorResponse(message));
    public static IResult Conflict(string message) => Results.Conflict(new ErrorResponse(message));
    public static IResult Unauthorized(string message) => Results.Json(new ErrorResponse(message), statusCode: StatusCodes.Status401Unauthorized);
}

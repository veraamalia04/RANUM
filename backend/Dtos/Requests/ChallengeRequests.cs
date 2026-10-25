using System.ComponentModel.DataAnnotations;
using Ranum.Api.Models;

namespace Ranum.Api.Dtos.Requests;

public record QuestionInput(
    QuestionType Type,
    [Required, MaxLength(1000)] string Text,
    List<string>? Options,
    int? CorrectIndex);

public record CreateChallengeRequest(
    [Required, MaxLength(100)] string Title,
    [MaxLength(1000)] string? Description,
    [Range(1, 12)] int? Kelas,
    [Required, MinLength(1), MaxLength(50)] List<QuestionInput> Questions,
    [MaxLength(3_000_000)] string? PosterUrl = null,
    List<Category>? Categories = null);

public record AnswerInput(
    int QuestionId,
    int? ChoiceIndex,
    [MaxLength(2000)] string? Text,
    [MaxLength(3_000_000)] string? ImageUrl);

// Also the body of PUT .../draft
public record SubmitRequest([Required] List<AnswerInput> Answers);

// Scores are keyed by answer id
public record GradeRequest([Required] Dictionary<int, int> Scores, [MaxLength(1000)] string? Feedback);

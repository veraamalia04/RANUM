using Ranum.Api.Dtos.Requests;
using Ranum.Api.Models;

namespace Ranum.Api.Dtos.Responses;

public record QuestionResponse(int Id, QuestionType Type, string Text, List<string> Options, int? CorrectIndex)
{
    public static QuestionResponse From(Question q, bool revealAnswer) =>
        new(q.Id, q.Type, q.Text, q.Options, revealAnswer ? q.CorrectIndex : null);
}

public record AnswerResponse(int Id, int QuestionId, int? ChoiceIndex, string? Text, string? ImageUrl, int? Score)
{
    public static AnswerResponse From(Answer a) => new(a.Id, a.QuestionId, a.ChoiceIndex, a.Text, a.ImageUrl, a.Score);
}

public record SubmissionResponse(
    int Id, int StudentId, string StudentName, string? StudentAvatar,
    DateTime SubmittedAt, int? Score, string? Feedback, List<AnswerResponse> Answers)
{
    public static SubmissionResponse From(Submission s) =>
        new(s.Id, s.StudentId, s.Student!.Username, s.Student.Avatar, s.SubmittedAt, s.Score, s.Feedback,
            s.Answers.Select(AnswerResponse.From).ToList());
}

public record ChallengeSummaryResponse(
    int Id, string Title, string? Description, int? Kelas, List<Category> Categories, int CreatedById, string CreatedBy, DateTime CreatedAt,
    List<QuestionType> Types, int QuestionCount, int SubmissionCount, int PendingCount,
    bool HasPoster, bool Accepted, int? MySubmissionId, int? MyScore, bool HasDraft);

public record ChallengeDetailResponse(
    int Id, string Title, string? Description, int? Kelas, List<Category> Categories, int CreatedById, string CreatedBy, DateTime CreatedAt,
    List<QuestionResponse> Questions, bool HasPoster, bool Accepted, SubmissionResponse? MySubmission)
{
    public static ChallengeDetailResponse From(Challenge c, bool accepted, SubmissionResponse? mine, bool revealAnswers) =>
        new(c.Id, c.Title, c.Description, c.Kelas, c.Categories, c.CreatedById, c.CreatedBy!.Username, c.CreatedAt,
            c.Questions.OrderBy(q => q.Position).Select(q => QuestionResponse.From(q, revealAnswers)).ToList(),
            c.PosterUrl != null, accepted, mine);
}

public record CreatedResponse(int Id);

public record DraftResponse(List<AnswerInput> Answers, DateTime UpdatedAt);

public record ResultResponse(int ChallengeId, string Title, int Score, string? Feedback, DateTime GradedAt);

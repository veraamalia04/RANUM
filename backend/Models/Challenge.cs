namespace Ranum.Api.Models;

public enum QuestionType { PilihanGanda, Essay, Menggambar }

public class Challenge
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    // Only a suggestion ("disarankan untuk kelas X"); every Siswa can take every challenge. null = semua kelas
    public int? Kelas { get; set; }
    public List<Category> Categories { get; set; } = [];
    // Optional JPEG data URL, served as an image by GET /api/challenges/{id}/poster
    public string? PosterUrl { get; set; }
    public int CreatedById { get; set; }
    public AppUser? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<Question> Questions { get; set; } = [];
    public List<Submission> Submissions { get; set; } = [];
    public List<Enrollment> Enrollments { get; set; } = [];
    public List<ChallengeDraft> Drafts { get; set; } = [];
}

// A Siswa's unsubmitted answers, saved automatically so they can continue later (from any device).
// Stored as the same AnswerInput JSON the submit endpoint takes; only the answer form reads it back.
public class ChallengeDraft
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public Challenge? Challenge { get; set; }
    public int StudentId { get; set; }
    public required string AnswersJson { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// A Siswa accepted this challenge into their list; they can only submit after accepting
public class Enrollment
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public int StudentId { get; set; }
    public AppUser? Student { get; set; }
    public DateTime AcceptedAt { get; set; }
}

public class Question
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public int Position { get; set; }
    public QuestionType Type { get; set; }
    public required string Text { get; set; }
    // PilihanGanda only
    public List<string> Options { get; set; } = [];
    public int? CorrectIndex { get; set; }
}

public class Submission
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public Challenge? Challenge { get; set; }
    public int StudentId { get; set; }
    public AppUser? Student { get; set; }
    public DateTime SubmittedAt { get; set; }
    // Final 0-100 score: average of the answer scores, set once every answer is scored
    public int? Score { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAt { get; set; }
    public List<Answer> Answers { get; set; } = [];

    public void FinalizeIfGraded()
    {
        if (Answers.Any(a => a.Score is null))
            return;
        Score = (int)Math.Round(Answers.Average(a => a.Score!.Value));
        GradedAt = DateTime.UtcNow;
    }
}

public class Answer
{
    public int Id { get; set; }
    public int SubmissionId { get; set; }
    // Plain id, not a relationship, so deleting a challenge has a single cascade path to answers
    public int QuestionId { get; set; }
    public int? ChoiceIndex { get; set; }
    public string? Text { get; set; }
    public string? ImageUrl { get; set; }
    public int? Score { get; set; }

    // Multiple choice answers always carry a ChoiceIndex; essays and drawings are graded by hand
    public bool NeedsManualGrade => ChoiceIndex is null;
}

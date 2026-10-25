using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Ranum.Api.Auth;
using Ranum.Api.Data;
using Ranum.Api.Dtos.Requests;
using Ranum.Api.Dtos.Responses;
using Ranum.Api.Http;
using Ranum.Api.Models;
using Ranum.Api.Validation;

namespace Ranum.Api.Handlers;

public static class ChallengesHandler
{
    // Every challenge is open to every Siswa (Kelas is only a suggestion).
    // ?category=Seni&category=Musik keeps challenges with any of those categories.
    public static async Task<IResult> List(Category[]? category, ClaimsPrincipal principal, AppDbContext db)
    {
        var me = principal.GetUserId();
        var query = db.Challenges.AsQueryable();
        if (category is { Length: > 0 })
            query = query.Where(c => c.Categories.Any(x => category.Contains(x)));

        var list = await query.OrderByDescending(c => c.CreatedAt).Select(c => new ChallengeSummaryResponse(
            c.Id, c.Title, c.Description, c.Kelas, c.Categories, c.CreatedById, c.CreatedBy!.Username, c.CreatedAt,
            c.Questions.Select(q => q.Type).ToList(),
            c.Questions.Count,
            c.Submissions.Count,
            c.Submissions.Count(s => s.Score == null),
            c.PosterUrl != null,
            c.Enrollments.Any(e => e.StudentId == me),
            c.Submissions.Where(s => s.StudentId == me).Select(s => (int?)s.Id).FirstOrDefault(),
            c.Submissions.Where(s => s.StudentId == me).Select(s => s.Score).FirstOrDefault(),
            c.Drafts.Any(d => d.StudentId == me)
        )).ToListAsync();

        // Distinct in memory: SQLite can't translate it inside the projection
        return Results.Ok(list.Select(c => c with { Types = c.Types.Distinct().ToList() }));
    }

    public static async Task<IResult> Get(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var challenge = await db.Challenges.Include(c => c.CreatedBy).Include(c => c.Questions).FirstOrDefaultAsync(c => c.Id == id);
        if (challenge is null)
            return Results.NotFound();

        var mine = principal.IsSiswa()
            ? await db.Submissions.Include(s => s.Student).Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.ChallengeId == id && s.StudentId == principal.GetUserId())
            : null;
        var accepted = await db.Enrollments.AnyAsync(e => e.ChallengeId == id && e.StudentId == principal.GetUserId());
        // Siswa only get the answer key after submitting
        var revealAnswers = !principal.IsSiswa() || mine is not null;
        return Results.Ok(ChallengeDetailResponse.From(challenge, accepted, mine is null ? null : SubmissionResponse.From(mine), revealAnswers));
    }

    public static async Task<IResult> Poster(int id, AppDbContext db)
    {
        var challenge = await db.Challenges.FindAsync(id);
        if (challenge?.PosterUrl is null)
            return Results.NotFound();
        return Results.File(Convert.FromBase64String(challenge.PosterUrl[ImageData.JpegPrefix.Length..]), "image/jpeg");
    }

    public static async Task<IResult> Accept(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        if (await db.Challenges.FindAsync(id) is null)
            return Results.NotFound();
        var me = principal.GetUserId();
        if (await db.Enrollments.AnyAsync(e => e.ChallengeId == id && e.StudentId == me))
            return ApiResults.Conflict("Challenge ini sudah ada di daftarmu");

        db.Enrollments.Add(new Enrollment { ChallengeId = id, StudentId = me, AcceptedAt = DateTime.UtcNow });
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> Create(CreateChallengeRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        for (var i = 0; i < req.Questions.Count; i++)
        {
            if (ValidateQuestion(req.Questions[i]) is { } error)
                return ApiResults.BadRequest($"Soal nomor {i + 1}: {error}");
        }
        if (req.PosterUrl is not null && !ImageData.IsJpegDataUrl(req.PosterUrl))
            return ApiResults.BadRequest("Poster harus berupa gambar JPEG");

        var challenge = new Challenge
        {
            Title = req.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description.Trim(),
            Kelas = req.Kelas,
            Categories = req.Categories?.Distinct().ToList() ?? [],
            PosterUrl = req.PosterUrl,
            CreatedById = principal.GetUserId(),
            CreatedAt = DateTime.UtcNow,
            Questions = req.Questions.Select((q, i) => new Question
            {
                Position = i,
                Type = q.Type,
                Text = q.Text.Trim(),
                Options = q.Type == QuestionType.PilihanGanda ? q.Options!.Select(o => o.Trim()).ToList() : [],
                CorrectIndex = q.Type == QuestionType.PilihanGanda ? q.CorrectIndex : null,
            }).ToList(),
        };
        db.Challenges.Add(challenge);
        await db.SaveChangesAsync();
        return Results.Created($"/api/challenges/{challenge.Id}", new CreatedResponse(challenge.Id));
    }

    public static async Task<IResult> Delete(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var challenge = await db.Challenges.FindAsync(id);
        if (challenge is null)
            return Results.NotFound();
        if (!CanManage(challenge, principal))
            return Results.Forbid();

        db.Challenges.Remove(challenge);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> Submit(int id, SubmitRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        var challenge = await db.Challenges.Include(c => c.Questions).FirstOrDefaultAsync(c => c.Id == id);
        var me = await db.CurrentUserAsync(principal);
        if (challenge is null || me is null)
            return Results.NotFound();
        if (await db.Submissions.AnyAsync(s => s.ChallengeId == id && s.StudentId == me.Id))
            return ApiResults.Conflict("Kamu sudah mengerjakan challenge ini");
        if (!await db.Enrollments.AnyAsync(e => e.ChallengeId == id && e.StudentId == me.Id))
            return ApiResults.BadRequest("Terima challenge ini dulu sebelum mengerjakan");

        var answers = new List<Answer>();
        foreach (var question in challenge.Questions.OrderBy(q => q.Position))
        {
            var input = req.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            if (input is null || !IsAnswered(question, input))
                return ApiResults.BadRequest($"Soal nomor {question.Position + 1} belum dijawab");
            answers.Add(ToAnswer(question, input));
        }

        var submission = new Submission { ChallengeId = id, Student = me, SubmittedAt = DateTime.UtcNow, Answers = answers };
        submission.FinalizeIfGraded();
        db.Submissions.Add(submission);
        // The draft is done with; removed in the same SaveChanges as the submission
        db.ChallengeDrafts.RemoveRange(db.ChallengeDrafts.Where(d => d.ChallengeId == id && d.StudentId == me.Id));
        await db.SaveChangesAsync();
        return Results.Ok(SubmissionResponse.From(submission));
    }

    // Pending first, so the guru sees what still needs grading
    public static async Task<IResult> Submissions(int id, AppDbContext db)
    {
        var submissions = await db.Submissions.Include(s => s.Student).Include(s => s.Answers)
            .Where(s => s.ChallengeId == id)
            .OrderBy(s => s.Score != null).ThenBy(s => s.SubmittedAt)
            .ToListAsync();
        return Results.Ok(submissions.Select(SubmissionResponse.From));
    }

    public static async Task<IResult> Grade(int id, int submissionId, GradeRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        var submission = await db.Submissions.Include(s => s.Challenge).Include(s => s.Student).Include(s => s.Answers)
            .FirstOrDefaultAsync(s => s.Id == submissionId && s.ChallengeId == id);
        if (submission is null)
            return Results.NotFound();
        if (!CanManage(submission.Challenge!, principal))
            return Results.Forbid();

        foreach (var answer in submission.Answers.Where(a => a.NeedsManualGrade))
        {
            if (!req.Scores.TryGetValue(answer.Id, out var score) || score is < 1 or > 100)
                return ApiResults.BadRequest("Setiap jawaban essay dan gambar butuh nilai 1-100");
            answer.Score = score;
        }
        submission.Feedback = string.IsNullOrWhiteSpace(req.Feedback) ? null : req.Feedback.Trim();
        submission.FinalizeIfGraded();
        await db.SaveChangesAsync();
        return Results.Ok(SubmissionResponse.From(submission));
    }

    public static async Task<IResult> GetDraft(int id, ClaimsPrincipal principal, AppDbContext db)
    {
        var draft = await db.ChallengeDrafts.FirstOrDefaultAsync(d => d.ChallengeId == id && d.StudentId == principal.GetUserId());
        if (draft is null)
            return Results.NotFound();
        return Results.Ok(new DraftResponse(JsonSerializer.Deserialize<List<AnswerInput>>(draft.AnswersJson, JsonSerializerOptions.Web)!, draft.UpdatedAt));
    }

    // Autosave from the answer form: same rules as submitting, except answers may be incomplete
    public static async Task<IResult> SaveDraft(int id, SubmitRequest req, ClaimsPrincipal principal, AppDbContext db)
    {
        var challenge = await db.Challenges.Include(c => c.Questions).FirstOrDefaultAsync(c => c.Id == id);
        var me = await db.CurrentUserAsync(principal);
        if (challenge is null || me is null)
            return Results.NotFound();
        if (await db.Submissions.AnyAsync(s => s.ChallengeId == id && s.StudentId == me.Id))
            return ApiResults.Conflict("Kamu sudah mengumpulkan challenge ini");
        if (!await db.Enrollments.AnyAsync(e => e.ChallengeId == id && e.StudentId == me.Id))
            return ApiResults.BadRequest("Terima challenge ini dulu sebelum mengerjakan");
        if (req.Answers.Any(a => a.ImageUrl is not null && !ImageData.IsJpegDataUrl(a.ImageUrl)))
            return ApiResults.BadRequest("Gambar harus berupa JPEG");

        // Keep only one answer per question of this challenge, so a draft can't grow without bound
        var questionIds = challenge.Questions.Select(q => q.Id).ToHashSet();
        var answers = req.Answers.Where(a => questionIds.Contains(a.QuestionId)).DistinctBy(a => a.QuestionId).ToList();
        var json = JsonSerializer.Serialize(answers, JsonSerializerOptions.Web);

        var draft = await db.ChallengeDrafts.FirstOrDefaultAsync(d => d.ChallengeId == id && d.StudentId == me.Id);
        if (draft is null)
            db.ChallengeDrafts.Add(new ChallengeDraft { ChallengeId = id, StudentId = me.Id, AnswersJson = json, UpdatedAt = DateTime.UtcNow });
        else
        {
            draft.AnswersJson = json;
            draft.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
        return Results.NoContent();
    }

    public static async Task<IResult> MyResults(ClaimsPrincipal principal, AppDbContext db)
    {
        var me = principal.GetUserId();
        var results = await db.Submissions
            .Where(s => s.StudentId == me && s.Score != null)
            .OrderByDescending(s => s.GradedAt)
            .Select(s => new ResultResponse(s.ChallengeId, s.Challenge!.Title, s.Score!.Value, s.Feedback, s.GradedAt!.Value))
            .ToListAsync();
        return Results.Ok(results);
    }

    // Only the guru who posted a challenge (or an admin) can grade or delete it
    private static bool CanManage(Challenge challenge, ClaimsPrincipal principal) =>
        principal.IsAdmin() || challenge.CreatedById == principal.GetUserId();

    private static string? ValidateQuestion(QuestionInput q)
    {
        if (string.IsNullOrWhiteSpace(q.Text))
            return "pertanyaan masih kosong";
        if (q.Type != QuestionType.PilihanGanda)
            return null;
        var options = q.Options ?? [];
        var validOptions = options.Count is >= 2 and <= 6 && options.All(o => !string.IsNullOrWhiteSpace(o) && o.Length <= 200);
        var validAnswer = q.CorrectIndex is int i && i >= 0 && i < options.Count;
        return validOptions && validAnswer ? null : "butuh 2-6 pilihan terisi dan satu jawaban benar";
    }

    private static bool IsAnswered(Question question, AnswerInput input) => question.Type switch
    {
        QuestionType.PilihanGanda => input.ChoiceIndex is int i && i >= 0 && i < question.Options.Count,
        QuestionType.Essay => !string.IsNullOrWhiteSpace(input.Text),
        QuestionType.Menggambar => input.ImageUrl is not null && ImageData.IsJpegDataUrl(input.ImageUrl),
        _ => false,
    };

    private static Answer ToAnswer(Question question, AnswerInput input) => new()
    {
        QuestionId = question.Id,
        ChoiceIndex = question.Type == QuestionType.PilihanGanda ? input.ChoiceIndex : null,
        Text = question.Type == QuestionType.Essay ? input.Text!.Trim() : null,
        ImageUrl = question.Type == QuestionType.Menggambar ? input.ImageUrl : null,
        // Multiple choice is scored right away, all or nothing
        Score = question.Type == QuestionType.PilihanGanda ? (input.ChoiceIndex == question.CorrectIndex ? 100 : 0) : null,
    };
}

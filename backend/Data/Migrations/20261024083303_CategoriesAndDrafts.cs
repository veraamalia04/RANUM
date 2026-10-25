using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ranum.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class CategoriesAndDrafts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Categories",
                table: "Posts",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Categories",
                table: "Challenges",
                type: "TEXT",
                nullable: false,
                defaultValue: "[]");

            // Keep the single category challenges already had, as a one-item list
            migrationBuilder.Sql("UPDATE Challenges SET Categories = json_array(Category) WHERE Category IS NOT NULL");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Challenges");

            migrationBuilder.CreateTable(
                name: "ChallengeDrafts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ChallengeId = table.Column<int>(type: "INTEGER", nullable: false),
                    StudentId = table.Column<int>(type: "INTEGER", nullable: false),
                    AnswersJson = table.Column<string>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChallengeDrafts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChallengeDrafts_Challenges_ChallengeId",
                        column: x => x.ChallengeId,
                        principalTable: "Challenges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChallengeDrafts_ChallengeId_StudentId",
                table: "ChallengeDrafts",
                columns: new[] { "ChallengeId", "StudentId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChallengeDrafts");

            migrationBuilder.DropColumn(
                name: "Categories",
                table: "Posts");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Challenges",
                type: "TEXT",
                nullable: true);

            // Going back keeps the first category
            migrationBuilder.Sql("UPDATE Challenges SET Category = json_extract(Categories, '$[0]')");

            migrationBuilder.DropColumn(
                name: "Categories",
                table: "Challenges");
        }
    }
}

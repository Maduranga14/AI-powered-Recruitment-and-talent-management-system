using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddInterviewFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FeedbackComments",
                table: "Interviews",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FeedbackOverallRating",
                table: "Interviews",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackRecommendation",
                table: "Interviews",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FeedbackSkillRatings",
                table: "Interviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FeedbackSubmittedAt",
                table: "Interviews",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FeedbackTechnicalScore",
                table: "Interviews",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FeedbackComments",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "FeedbackOverallRating",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "FeedbackRecommendation",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "FeedbackSkillRatings",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "FeedbackSubmittedAt",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "FeedbackTechnicalScore",
                table: "Interviews");
        }
    }
}

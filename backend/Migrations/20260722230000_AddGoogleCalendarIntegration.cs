using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleCalendarIntegration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarEventId",
                table: "Interviews",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleCalendarHtmlLink",
                table: "Interviews",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSyncedToGoogleCalendar",
                table: "Interviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "GoogleCalendarIntegrations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IsConnected = table.Column<bool>(type: "bit", nullable: false),
                    GoogleEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    AccessToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    TokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CalendarId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    AutoSyncInterviews = table.Column<bool>(type: "bit", nullable: false),
                    ConnectedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoogleCalendarIntegrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoogleCalendarIntegrations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GoogleCalendarIntegrations_UserId",
                table: "GoogleCalendarIntegrations",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GoogleCalendarIntegrations");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarEventId",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "GoogleCalendarHtmlLink",
                table: "Interviews");

            migrationBuilder.DropColumn(
                name: "IsSyncedToGoogleCalendar",
                table: "Interviews");
        }
    }
}

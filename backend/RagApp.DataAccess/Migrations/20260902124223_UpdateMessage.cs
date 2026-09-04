using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RagApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ErrorSeverity",
                table: "Messages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsError",
                table: "Messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ErrorSeverity",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "IsError",
                table: "Messages");
        }
    }
}

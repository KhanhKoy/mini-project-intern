using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniShopApi.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "orders");
        }
    }
}

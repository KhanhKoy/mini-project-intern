using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniShopApi.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingInfoToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "fullname",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phonenumber",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "shippingaddress",
                table: "orders",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fullname",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "phonenumber",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "shippingaddress",
                table: "orders");
        }
    }
}

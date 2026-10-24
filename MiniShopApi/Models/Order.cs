namespace MiniShopApi.Models;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    // Shipping information
    public string FullName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;

    // Status: pending, processing, shipped, delivered, cancelled
    public string Status { get; set; } = "pending";

    // Navigation properties
    public User? User { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

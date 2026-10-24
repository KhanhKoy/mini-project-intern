using System.ComponentModel.DataAnnotations;

namespace MiniShopApi.DTOs;

public class CreateOrderDto
{
    [Required(ErrorMessage = "UserId là bắt buộc.")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Danh sách sản phẩm không được để trống.")]
    [MinLength(1, ErrorMessage = "Giỏ hàng phải có ít nhất 1 sản phẩm.")]
    public List<CartItemDto> Items { get; set; } = new();

    // Shipping information (required for checkout)
    [Required(ErrorMessage = "Họ tên là bắt buộc.")]
    [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Địa chỉ giao hàng là bắt buộc.")]
    [StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự.")]
    public string ShippingAddress { get; set; } = string.Empty;

    [Required(ErrorMessage = "Số điện thoại là bắt buộc.")]
    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự.")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    public string PhoneNumber { get; set; } = string.Empty;
}

public class CartItemDto
{
    [Required(ErrorMessage = "ProductId là bắt buộc.")]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public int Quantity { get; set; }
}

using System.ComponentModel.DataAnnotations;

namespace MiniShopApi.DTOs;

public class CreateOrderDto
{
    [Required(ErrorMessage = "UserId là bắt buộc.")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Danh sách sản phẩm không được để trống.")]
    [MinLength(1, ErrorMessage = "Giỏ hàng phải có ít nhất 1 sản phẩm.")]
    public List<CartItemDto> Items { get; set; } = new();
}

public class CartItemDto
{
    [Required(ErrorMessage = "ProductId là bắt buộc.")]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0.")]
    public int Quantity { get; set; }
}

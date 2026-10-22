using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniShopApi.Data;
using MiniShopApi.Models;

namespace MiniShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderItemsController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrderItemsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/orderitems
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderItem>>> GetOrderItems()
    {
        var orderItems = await _context.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Product)
            .AsNoTracking()
            .ToListAsync();

        return Ok(orderItems);
    }

    // GET: api/orderitems/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderItem>> GetOrderItem(int id)
    {
        var orderItem = await _context.OrderItems
            .Include(oi => oi.Order)
            .Include(oi => oi.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(oi => oi.Id == id);

        if (orderItem == null)
        {
            return NotFound(new { message = $"Không tìm thấy chi tiết đơn hàng có Id = {id}" });
        }

        return Ok(orderItem);
    }

    // GET: api/orderitems/order/{orderId}
    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<IEnumerable<OrderItem>>> GetOrderItemsByOrder(int orderId)
    {
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == orderId);
        if (!orderExists)
        {
            return NotFound(new { message = $"Không tìm thấy đơn hàng có Id = {orderId}" });
        }

        var orderItems = await _context.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .Include(oi => oi.Product)
            .AsNoTracking()
            .ToListAsync();

        return Ok(orderItems);
    }

    // POST: api/orderitems
    [HttpPost]
    public async Task<ActionResult<OrderItem>> CreateOrderItem(OrderItem orderItem)
    {
        // Validate Order exists
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == orderItem.OrderId);
        if (!orderExists)
        {
            return BadRequest(new { message = $"Đơn hàng với Id = {orderItem.OrderId} không tồn tại" });
        }

        // Validate Product exists
        var product = await _context.Products.FindAsync(orderItem.ProductId);
        if (product == null)
        {
            return BadRequest(new { message = $"Sản phẩm với Id = {orderItem.ProductId} không tồn tại" });
        }

        // Set UnitPrice from current product price if not provided
        if (orderItem.UnitPrice == 0)
        {
            orderItem.UnitPrice = product.Price;
        }

        _context.OrderItems.Add(orderItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOrderItem), new { id = orderItem.Id }, orderItem);
    }

    // PUT: api/orderitems/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrderItem(int id, OrderItem orderItem)
    {
        if (id != orderItem.Id)
        {
            return BadRequest(new { message = "Id không khớp" });
        }

        var existingOrderItem = await _context.OrderItems.FindAsync(id);
        if (existingOrderItem == null)
        {
            return NotFound(new { message = $"Không tìm thấy chi tiết đơn hàng có Id = {id}" });
        }

        // Validate Order exists
        var orderExists = await _context.Orders.AnyAsync(o => o.Id == orderItem.OrderId);
        if (!orderExists)
        {
            return BadRequest(new { message = $"Đơn hàng với Id = {orderItem.OrderId} không tồn tại" });
        }

        // Validate Product exists
        var productExists = await _context.Products.AnyAsync(p => p.Id == orderItem.ProductId);
        if (!productExists)
        {
            return BadRequest(new { message = $"Sản phẩm với Id = {orderItem.ProductId} không tồn tại" });
        }

        _context.Entry(existingOrderItem).CurrentValues.SetValues(orderItem);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.OrderItems.Any(e => e.Id == id))
            {
                return NotFound(new { message = $"Không tìm thấy chi tiết đơn hàng có Id = {id}" });
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/orderitems/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrderItem(int id)
    {
        var orderItem = await _context.OrderItems.FindAsync(id);
        if (orderItem == null)
        {
            return NotFound(new { message = $"Không tìm thấy chi tiết đơn hàng có Id = {id}" });
        }

        _context.OrderItems.Remove(orderItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniShopApi.Data;
using MiniShopApi.Models;

namespace MiniShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/products/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = $"Không tìm thấy sản phẩm có Id = {id}" });
        }

        return Ok(product);
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        // Validate CategoryId if provided
        if (product.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { message = $"Danh mục với Id = {product.CategoryId} không tồn tại" });
            }
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Reload with Category for response
        var createdProduct = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstAsync(p => p.Id == product.Id);

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, createdProduct);
    }

    // PUT: api/products/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id)
        {
            return BadRequest(new { message = "Id không khớp" });
        }

        var existingProduct = await _context.Products.FindAsync(id);
        if (existingProduct == null)
        {
            return NotFound(new { message = $"Không tìm thấy sản phẩm có Id = {id}" });
        }

        // Validate CategoryId if provided
        if (product.CategoryId.HasValue)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == product.CategoryId.Value);
            if (!categoryExists)
            {
                return BadRequest(new { message = $"Danh mục với Id = {product.CategoryId} không tồn tại" });
            }
        }

        _context.Entry(existingProduct).CurrentValues.SetValues(product);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Products.Any(e => e.Id == id))
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có Id = {id}" });
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = $"Không tìm thấy sản phẩm có Id = {id}" });
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
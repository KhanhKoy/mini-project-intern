using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniShopApi.Data;
using MiniShopApi.Models;

namespace MiniShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/users
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .ToListAsync();

        return Ok(users);
    }

    // GET: api/users/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng có Id = {id}" });
        }

        return Ok(user);
    }

    // POST: api/users
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        // Check duplicate username
        var usernameExists = await _context.Users.AnyAsync(u => u.Username == user.Username);
        if (usernameExists)
        {
            return BadRequest(new { message = $"Tên đăng nhập '{user.Username}' đã tồn tại" });
        }

        // Set default values
        user.CreatedAt = DateTime.UtcNow;
        if (string.IsNullOrEmpty(user.Role))
        {
            user.Role = "Customer";
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Don't return password hash in response
        var createdUser = new User
        {
            Id = user.Id,
            Username = user.Username,
            Role = user.Role,
            CreatedAt = user.CreatedAt
        };

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, createdUser);
    }

    // PUT: api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest(new { message = "Id không khớp" });
        }

        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng có Id = {id}" });
        }

        // Check duplicate username (excluding current user)
        var usernameExists = await _context.Users
            .AnyAsync(u => u.Username == user.Username && u.Id != id);
        if (usernameExists)
        {
            return BadRequest(new { message = $"Tên đăng nhập '{user.Username}' đã tồn tại" });
        }

        // Don't allow changing CreatedAt
        user.CreatedAt = existingUser.CreatedAt;

        _context.Entry(existingUser).CurrentValues.SetValues(user);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Users.Any(e => e.Id == id))
            {
                return NotFound(new { message = $"Không tìm thấy người dùng có Id = {id}" });
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = $"Không tìm thấy người dùng có Id = {id}" });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
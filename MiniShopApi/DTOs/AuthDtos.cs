namespace MiniShopApi.DTOs;

public record RegisterRequest(
    string Username,
    string Email,
    string Password
);

public record LoginRequest(
    string Identifier,
    string Password
);

public record AuthResponse(
    bool Success,
    string? Message = null,
    string? Token = null,
    UserInfo? User = null
);

public record UserInfo(
    int Id,
    string Username,
    string Email,
    string Role
);
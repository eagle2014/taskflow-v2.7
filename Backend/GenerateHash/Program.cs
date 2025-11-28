using BCrypt.Net;

var hash = BCrypt.Net.BCrypt.HashPassword("Admin@2025!");
Console.WriteLine($"Password Hash: {hash}");

using System;

// Generate BCrypt hash for "admin123"
var password = "admin123";
var hash = BCrypt.Net.BCrypt.HashPassword(password, 12);

Console.WriteLine($"Password: {password}");
Console.WriteLine($"BCrypt Hash: {hash}");
Console.WriteLine($"\nVerification test: {BCrypt.Net.BCrypt.Verify(password, hash)}");
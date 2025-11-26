// Generate BCrypt hash for password "admin123"
#r "nuget: BCrypt.Net-Next, 4.0.3"

using BCrypt.Net;

var password = "admin123";
var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

Console.WriteLine($"Password: {password}");
Console.WriteLine($"BCrypt Hash: {hash}");
Console.WriteLine();
Console.WriteLine("Verification test:");
Console.WriteLine($"Hash matches password: {BCrypt.Net.BCrypt.Verify(password, hash)}");
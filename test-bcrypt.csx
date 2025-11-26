// Test BCrypt hash verification
#r "nuget: BCrypt.Net-Next, 4.0.3"

using BCrypt.Net;

var password = "admin123";
var hash = "$2a$12$K2ybFsoJzxPXfOCXHKWMxOe.qRZU9F/Z3pjKvJq2QZ.FQqP5PvXuu";

Console.WriteLine("Password: " + password);
Console.WriteLine("Hash: " + hash);
Console.WriteLine("Verification result: " + BCrypt.Verify(password, hash));

// Generate a new hash for "admin123"
var newHash = BCrypt.HashPassword(password, 12);
Console.WriteLine("\nNew hash for 'admin123': " + newHash);
Console.WriteLine("New hash verification: " + BCrypt.Verify(password, newHash));
using System.Security.Cryptography;
using System.Text;

namespace RagApp.BusinessLayer.Security;

public static class PasswordHasher
{
    public static string GenerateSalt()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes);
    }

    public static string Hash(string password, string salt, string pepper, int userId, long timestamp)
    {
        var raw = $"{password}{salt}{pepper}{userId}{timestamp}";
        var bytes = SHA512.HashData(Encoding.UTF8.GetBytes(raw));
        return Convert.ToBase64String(bytes);
    }

    public static bool Verify(string password, string storedHash, string salt, string pepper, int userId, long timestamp)
    {
        var hash = Hash(password, salt, pepper, userId, timestamp);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(hash),
            Encoding.UTF8.GetBytes(storedHash)
        );
    }
}
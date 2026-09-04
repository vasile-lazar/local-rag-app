using RagApp.BusinessLayer.Security;
using RagApp.DataAccess.Context;
using RagApp.Domain.Entities.User;
using RagApp.Domain.Enums;
using RagApp.Domain.Models.Auth;
using RagApp.Domain.Models.Service;

namespace RagApp.BusinessLayer.Structure;

public class AuthActions
{
    private readonly RagAppDbContext _context;
    private readonly string _pepper;

    public AuthActions(RagAppDbContext context)
    {
        _context = context;
        _pepper = Environment.GetEnvironmentVariable("AUTH_PEPPER")
                  ?? throw new Exception("AUTH_PEPPER not configured.");
    }

    public ServiceResponse RegisterAction(RegisterDto dto)
    {
        var exists = _context.Users.Any(u => u.Email == dto.Email);
        if (exists)
            return new ServiceResponse { IsSuccess = false, Message = "Email already taken." };

        if (dto.Password != dto.ConfirmPassword)
            return new ServiceResponse { IsSuccess = false, Message = "Passwords do not match." };

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var salt = PasswordHasher.GenerateSalt();

        var tempEntity = new UserEntity
        {
            Username = dto.Username,
            Email = dto.Email,
            Salt = salt,
            CreatedAtTimestamp = timestamp,
            Role = UserType.User,
            Status = StatusType.Active,
            PasswordHash = "temp"
        };

        try
        {
            _context.Users.Add(tempEntity);
            _context.SaveChanges();

            var hash = PasswordHasher.Hash(dto.Password, salt, _pepper, tempEntity.Id, timestamp);
            tempEntity.PasswordHash = hash;
            _context.SaveChanges();
        }
        catch (Exception e)
        {
            return new ServiceResponse { IsSuccess = false, Message = e.Message };
        }

        return new ServiceResponse { IsSuccess = true, Message = "Registration successful." };
    }

    public ServiceResponse LoginAction(LoginDto dto)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
        if (user == null)
            return new ServiceResponse { IsSuccess = false, Message = "Invalid credentials." };

        if (user.Status == StatusType.Suspended)
            return new ServiceResponse { IsSuccess = false, Message = "Account suspended." };

        var valid = PasswordHasher.Verify(
            dto.Password, user.PasswordHash, user.Salt, _pepper, user.Id, user.CreatedAtTimestamp
        );

        if (!valid)
            return new ServiceResponse { IsSuccess = false, Message = "Invalid credentials." };

        var token = JwtGenerator.Generate(user);

        return new ServiceResponse
        {
            IsSuccess = true,
            Data = new AuthResponseDto
            {
                Id = user.Id,
                Token = token,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
            }
        };
    }
}
using RagApp.Domain.Models.Auth;
using RagApp.Domain.Models.Service;

namespace RagApp.BusinessLayer.Interfaces;

public interface IAuthLogic
{
    ServiceResponse Register(RegisterDto dto);
    ServiceResponse Login(LoginDto dto);
}
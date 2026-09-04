using RagApp.BusinessLayer.Interfaces;
using RagApp.BusinessLayer.Structure;
using RagApp.Domain.Models.Auth;
using RagApp.Domain.Models.Service;

namespace RagApp.BusinessLayer.Core;

public class AuthLogic : AuthActions, IAuthLogic
{
    public AuthLogic(RagApp.DataAccess.Context.RagAppDbContext context) : base(context) { }

    public ServiceResponse Register(RegisterDto dto) => RegisterAction(dto);
    public ServiceResponse Login(LoginDto dto) => LoginAction(dto);
}
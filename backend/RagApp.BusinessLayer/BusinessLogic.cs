using RagApp.BusinessLayer.Core;
using RagApp.BusinessLayer.Interfaces;
using RagApp.DataAccess.Context;

namespace RagApp.BusinessLayer;

public class BusinessLogic
{
    private readonly RagAppDbContext _context;
    private readonly HttpClient _httpClient;

    public BusinessLogic(RagAppDbContext context, HttpClient httpClient)
    {
        _context = context;
        _httpClient = httpClient;
    }

    public IAuthLogic GetAuthLogic()
    {
        return new AuthLogic(_context);
    }

    public IConversationLogic GetConversationLogic()
    {
        return new ConversationLogic(_context, _httpClient);
    }
}
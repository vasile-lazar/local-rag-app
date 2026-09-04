using System.Security.Claims;
using RagApp.BusinessLayer;
using RagApp.BusinessLayer.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RagApp.Domain.Models.Message;

namespace RagApp.Api.Controllers;

[ApiController]
[Route("api/conversations")]
[Authorize]
public class ConversationsController : ControllerBase
{
    private readonly IConversationLogic _conversationLogic;

    public ConversationsController(BusinessLogic businessLogic)
    {
        _conversationLogic = businessLogic.GetConversationLogic();
    }

    private int CurrentUserId =>
    int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    
    [HttpGet]
    public IActionResult GetConversations()
    {
        var response = _conversationLogic.GetConversations(CurrentUserId);
        return Ok(response.Data);
    }

    [HttpGet("{id}")]
    public IActionResult GetConversation(int id)
    {
        var response = _conversationLogic.GetConversationDetail(CurrentUserId, id);
        if (!response.IsSuccess)
            return NotFound(response.Message);

        return Ok(response.Data);
    }
    
    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] AskDto dto)
    {
        var response = await _conversationLogic.Ask(CurrentUserId, dto);
        if (!response.IsSuccess)
            return BadRequest(response.Message);

        return Ok(response.Data);
    }
}
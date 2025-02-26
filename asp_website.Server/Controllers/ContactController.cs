using Microsoft.AspNetCore.Mvc;
using asp_website.Server.Models;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ContactController : ControllerBase
    {
        public ContactController()
        {
            
        }

        [HttpPost]
        public bool Post([FromBody] EmailInfo emailInfo)
        {
            if (emailInfo == null || string.IsNullOrWhiteSpace(emailInfo.sender) || string.IsNullOrWhiteSpace(emailInfo.body))
                return false;

            return true;
        }

    }
}

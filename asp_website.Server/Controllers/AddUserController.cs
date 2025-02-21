using Microsoft.AspNetCore.Mvc;
using asp_website.Server.Models;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AddUserController : ControllerBase
    {
        User user;

        public AddUserController()
        {
            user = new User();
        }

        [HttpPost(Name = "AddNewUser")]
        public bool Post([FromBody] LogonCredentials newCredentials)
        {
            if (newCredentials != null && !string.IsNullOrWhiteSpace(newCredentials.username)
                && !string.IsNullOrWhiteSpace(newCredentials.emailAddress)
                && !string.IsNullOrWhiteSpace(newCredentials.password))
            {
                int newUserNumber = user.AddUser(newCredentials.username, newCredentials.emailAddress, newCredentials.password);
                if (newUserNumber > 0)
                {
                    return true;
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return false;
        }

    }
}

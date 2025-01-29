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

        [HttpGet(Name = "AddUserInfo")]
        public string Get()
        {
            return "Add user test GET from ASP.NET successful";
        }

        [HttpPost(Name = "AddNewUser")]
        public bool Post([FromBody] LogonCredentials newCredentials)
        {
            if (newCredentials != null && newCredentials.username != null && newCredentials.password != null)
            {
                int newUserNumber = user.AddUser(newCredentials.username, newCredentials.password);
                if (newUserNumber > 0)
                {
                    return true;
                }
            }

            return false;
        }

    }
}

using Microsoft.AspNetCore.Mvc;
using asp_website.Server.Models;

namespace asp_website.Server.Controllers
{
    public class AddUserController : Controller
    {
        public AddUserController()
        {
            User user = new User();
        }

        [HttpPost(Name = "AddNewUser")]
        public bool Post([FromBody] LogonCredentials newCredentials)
        {


            return false;
        }

    }
}

using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LogOnInfoController : ControllerBase
    {

        public LogOnInfoController()
        {
            
        }

        [HttpGet(Name = "GetLogOnInfo")]
        public string Get()
        {
            return "Logon test GET from ASP.NET successful";
        }


        [HttpPost(Name = "TryToLogIn")]
        public string Post([FromBody] LogonCredentials credentials)
        {
            if (credentials != null)
            {
                if (!string.IsNullOrEmpty(credentials.username) && !string.IsNullOrEmpty(credentials.password))
                {
                    // TODO: Verify credentials

                    return "asdf1234";
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return "";
        }
    }
}

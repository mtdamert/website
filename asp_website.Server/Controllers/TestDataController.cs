using Microsoft.AspNetCore.Mvc;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestDataController : ControllerBase
    {
        public TestDataController()
        {
            
        }

        [HttpGet(Name = "Get")]
        public string Get()
        {
            return "Retrieving data from the back end is successful";
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ArkanoidLevelController : ControllerBase
    {
        public ArkanoidLevelController()
        {
        }

        [HttpGet(Name = "GetArkanoidLevel")]
        public string Get(int id)
        {
            string levelName = "ark_level" + id + ".ldtk";

            if (System.IO.File.Exists(levelName))
            {
                // Load high scores from file 
                string json = System.IO.File.ReadAllText(levelName);
                if (!string.IsNullOrEmpty(json))
                {
                    return json;
                }
            }

            return string.Empty;
        }
    }
}

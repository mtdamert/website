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
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(int id)
        {
            //string levelName = "..\\asp_website.client\\src\\ark_levels\\ark_level" + id + ".ldtk";
            string levelName = "ark_levels\\ark_level" + id + ".ldtk";

            if (System.IO.File.Exists(levelName))
            {
                // Load high scores from file 
                string json = System.IO.File.ReadAllText(levelName);
                if (!string.IsNullOrEmpty(json))
                {
                    return Ok(json);
                }
            }

            return NotFound();
        }
    }
}

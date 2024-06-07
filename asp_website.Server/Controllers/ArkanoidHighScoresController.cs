using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ArkanoidHighScoresController : ControllerBase
    {
        const int NUM_HIGH_SCORES = 5;

        HighScores[]? highScores;
        const string highScoresPath = "ArkanoidHighScores.txt";

        public ArkanoidHighScoresController()
        {
            if (System.IO.File.Exists(highScoresPath))
            {
                // Load high scores from file 
                string json = System.IO.File.ReadAllText(highScoresPath);
                if (!string.IsNullOrEmpty(json))
                {
                    HighScores[]? items = JsonSerializer.Deserialize<HighScores[]>(json);
                    if (items != null && items.Length > 0)
                        highScores = items;
                }
            }
        }

        [HttpGet(Name = "GetArkanoidHighScores")]
        public HighScores[] Get()
        {
            if (highScores == null)
            {
                highScores = new HighScores[NUM_HIGH_SCORES];
                for (int i = 0; i < NUM_HIGH_SCORES; i++)
                {
                    highScores[i] = new HighScores();
                    highScores[i].HighScore = 0;
                    highScores[i].ScorerName = "";
                    highScores[i].IsCurrentScore = false;
                }
            }

            return highScores;
        }

        [HttpPost(Name = "SetArkanoidHighScores")]
        public void Post([FromBody] HighScores[] arkanoidHighScores)
        {
            // Save data to a file
            highScores = arkanoidHighScores;

            string jsonString = JsonSerializer.Serialize(arkanoidHighScores);
            using (StreamWriter writer = new StreamWriter(highScoresPath))
            {
                writer.WriteLine(jsonString);
            }

        }
    }
}

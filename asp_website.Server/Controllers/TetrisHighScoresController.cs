using Microsoft.AspNetCore.Mvc;
using System.Text.Json;


namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TetrisHighScoresController : ControllerBase
    {
        const int NUM_HIGH_SCORES = 5;

        int revisionNumber;
        TetrisHighScores[]? highScores;
        const string highScoresPath = "TetrisHighScores.txt";

        public TetrisHighScoresController()
        {
            // Load high scores from file 
            string json = System.IO.File.ReadAllText(highScoresPath);
            if (!string.IsNullOrEmpty(json))
            {
                TetrisHighScores[]? items = JsonSerializer.Deserialize<TetrisHighScores[]>(json);
                if (items != null && items.Length > 0)
                    highScores = items;
            }
        }

        [HttpGet(Name = "GetTetrisHighScores")]
        public TetrisHighScores[] Get()
        {
            if (highScores == null) {
                highScores = new TetrisHighScores[NUM_HIGH_SCORES];
                for (int i=0; i< NUM_HIGH_SCORES; i++) {
                    highScores[i].HighScore = 0;
                    highScores[i].ScorerName = "";
                    highScores[i].IsCurrentScore = false;
                }
            }

            return highScores;
        }

        [HttpPost(Name = "SetTetrisHighScores")]
        public void Post([FromBody] TetrisHighScores[] tetrisHighScores)
        {
            // Save data to a file
            highScores = tetrisHighScores;

            string jsonString = JsonSerializer.Serialize(tetrisHighScores);
            using (StreamWriter writer = new StreamWriter(highScoresPath))
            {
                writer.WriteLine(jsonString);
            }

        }
    }
}

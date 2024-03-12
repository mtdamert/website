using Microsoft.AspNetCore.Mvc;
using System.Text.Json;


namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TetrisHighScoresController : ControllerBase
    {
        int revisionNumber;
        TetrisHighScores[]? highScores;
        const string highScoresPath = "TetrisHighScores.txt";

        public TetrisHighScoresController()
        {
            // Load high scores from file 
            string json = System.IO.File.ReadAllText(highScoresPath);
            TetrisHighScores[]? items = JsonSerializer.Deserialize<TetrisHighScores[]>(json);
            if (items != null && items.Length > 0)
                highScores = items;
        }

        [HttpGet(Name = "GetTetrisHighScores")]
        public TetrisHighScores[] Get()
        {
            //TetrisHighScores[] tetrisHighScores = new TetrisHighScores[5];
            //for (int i=0; i<5; i++) { tetrisHighScores[i] = new TetrisHighScores(); }

            //tetrisHighScores[0].HighScore = 124380;
            //tetrisHighScores[0].ScorerName = "mtdamert";
            //tetrisHighScores[0].IsCurrentScore = false;

            //tetrisHighScores[1].HighScore = 29740;
            //tetrisHighScores[1].ScorerName = "Testing";
            //tetrisHighScores[1].IsCurrentScore = false;

            //tetrisHighScores[2].HighScore = 25640;
            //tetrisHighScores[2].ScorerName = "Still Testing";
            //tetrisHighScores[2].IsCurrentScore = false;

            //tetrisHighScores[3].HighScore = 2000;
            //tetrisHighScores[3].ScorerName = "Testing Again";
            //tetrisHighScores[3].IsCurrentScore = false;
            //tetrisHighScores[4].HighScore = 1000;
            //tetrisHighScores[4].ScorerName = "Final Testing";
            //tetrisHighScores[4].IsCurrentScore = false;

            //string jsonString = JsonSerializer.Serialize(tetrisHighScores);
            //using (StreamWriter writer = new StreamWriter(highScoresPath))
            //{
            //    writer.WriteLine(jsonString);
            //}

            //return tetrisHighScores;

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

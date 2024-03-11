using Microsoft.AspNetCore.Mvc;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TetrisHighScoresController : ControllerBase
    {
        public TetrisHighScoresController()
        {
            
        }

        [HttpGet(Name = "GetTetrisHighScores")]
        public TetrisHighScores[] Get()
        {
            TetrisHighScores[] tetrisHighScores = new TetrisHighScores[5];
            for (int i=0; i<5; i++) { tetrisHighScores[i] = new TetrisHighScores(); }

            tetrisHighScores[0].HighScore = 124380;
            tetrisHighScores[0].ScorerName = "mtdamert";
            tetrisHighScores[0].IsCurrentScore = false;

            tetrisHighScores[1].HighScore = 29740;
            tetrisHighScores[1].ScorerName = "Testing";
            tetrisHighScores[1].IsCurrentScore = false;

            tetrisHighScores[2].HighScore = 25640;
            tetrisHighScores[2].ScorerName = "Still Testing";
            tetrisHighScores[2].IsCurrentScore = false;

            tetrisHighScores[3].HighScore = 2000;
            tetrisHighScores[3].ScorerName = "Testing Again";
            tetrisHighScores[3].IsCurrentScore = false;
            tetrisHighScores[4].HighScore = 1000;
            tetrisHighScores[4].ScorerName = "Final Testing";
            tetrisHighScores[4].IsCurrentScore = false;

            return tetrisHighScores;
        }

        [HttpPost(Name = "SetTetrisHighScores")]
        public void Post([FromBody] TetrisHighScores[] tetrisHighScores)
        {
            // TODO: Save data to a file
        }
    }
}

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

            tetrisHighScores[0].HighScore = 29740;
            tetrisHighScores[0].TestString = "Testing";

            tetrisHighScores[1].HighScore = 25640;
            tetrisHighScores[1].TestString = "Still Testing";

            tetrisHighScores[2].HighScore = 3000;
            tetrisHighScores[2].TestString = "More Testing";
            tetrisHighScores[3].HighScore = 2000;
            tetrisHighScores[3].TestString = "Testing Again";
            tetrisHighScores[4].HighScore = 1000;
            tetrisHighScores[4].TestString = "Final Testing";

            return tetrisHighScores;
        }
    }
}

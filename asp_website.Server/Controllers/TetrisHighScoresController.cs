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
        public TetrisHighScores Get()
        {
            TetrisHighScores tetrisHighScores = new TetrisHighScores();
            tetrisHighScores.HighScore = 29740;
            tetrisHighScores.TestString = "Testing";
            // second place: 25640

            return tetrisHighScores;
        }
    }
}

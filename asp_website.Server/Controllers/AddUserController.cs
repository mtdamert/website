using Microsoft.AspNetCore.Mvc;
using asp_website.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AddUserController : ControllerBase
    {
        User user;

        public AddUserController()
        {
            user = new User();
        }

        private string CreateToken(string? username, string emailAddress, string? userRole, string? authentication)
        {
            if (username == null) username = string.Empty;
            if (userRole == null) userRole = string.Empty;
            if (authentication == null) authentication = string.Empty;

            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Email, emailAddress),
                new Claim(ClaimTypes.Role, userRole),
                new Claim(ClaimTypes.Authentication, authentication)
             };

            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                    "aVeryVeryLongSecretKeyThatIsAtLeast512BytesLong,WhichMeansAtLeast64CharactersLong")); // TODO: Move this to an external file
            SigningCredentials cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            JwtSecurityToken token = new JwtSecurityToken(
                                   claims: claims,
                                   expires: DateTime.UtcNow.AddDays(1),
                                   signingCredentials: cred
            );
            string jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return jwt;
        }

        [HttpPost(Name = "AddNewUser")]
        public string Post([FromBody] LogonCredentials newCredentials)
        {
            if (newCredentials != null && !string.IsNullOrWhiteSpace(newCredentials.username)
                && !string.IsNullOrWhiteSpace(newCredentials.emailAddress)
                && !string.IsNullOrWhiteSpace(newCredentials.password))
            {
                int newUserNumber = user.AddUser(newCredentials.username, newCredentials.emailAddress, newCredentials.password);
                if (newUserNumber > 0)
                {
                    return CreateToken(newCredentials.username, newCredentials.emailAddress, UserInfo.Client, string.Empty);
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return string.Empty;
        }

    }
}

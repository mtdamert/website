using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using asp_website.Server.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LogOnInfoController : ControllerBase
    {
        User user;

        public LogOnInfoController()
        {
            user = new User();
        }

        public static byte[] GenerateSaltedHash(byte[] plainText, byte[] salt)
        {
            byte[] plainTextWithSaltBytes =
              new byte[plainText.Length + salt.Length];

            for (int i = 0; i < plainText.Length; i++)
            {
                plainTextWithSaltBytes[i] = plainText[i];
            }
            for (int i = 0; i < salt.Length; i++)
            {
                plainTextWithSaltBytes[plainText.Length + i] = salt[i];
            }

            using (HashAlgorithm algorithm = SHA256.Create())
                return algorithm.ComputeHash(plainTextWithSaltBytes);
        }

        public static bool CompareByteArrays(byte[] array1, byte[] array2)
        {
            if (array1.Length != array2.Length)
            {
                return false;
            }

            for (int i = 0; i < array1.Length; i++)
            {
                if (array1[i] != array2[i])
                {
                    return false;
                }
            }

            return true;
        }

        public static string Base64Encode(string plainText)
        {
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            return Convert.ToBase64String(plainTextBytes);
        }

        [HttpGet(Name = "GetLogOnInfo")]
        public string Get()
        {
            return "Logon test GET from ASP.NET successful";
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

        [HttpPost(Name = "TryToLogIn")]
        public string Post([FromBody] LogonCredentials credentials)
        {
            // If the user is verified, return a token for them
            if (credentials != null && credentials.emailAddress != null && credentials.password != null)
            {
                if (user.IsUserValid(credentials.emailAddress, credentials.password) != false)
                {
                    UserInfo? userInfo = user.GetUserInfo(credentials.emailAddress);
                    if (userInfo != null)
                    {
                        return CreateToken(userInfo.username, credentials.emailAddress, userInfo.userRole, userInfo.emailConfirmed ? "Authenticated" : string.Empty);
                    }
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return "";
        }
    }
}

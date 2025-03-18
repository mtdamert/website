using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Xml.Serialization;

namespace asp_website.Server.Controllers
{
    namespace asp_website.Server.Controllers
    {
        public class EmailConfirmationInfo
        {
            public int? userId { get; set; }
            public string? emailConfirmationGuid { get; set; }
        }

        [ApiController]
        [Route("[controller]")]
        public class ConfirmEmailController : ControllerBase
        {
            const string passwordFileXml = "passwordsXml.txt";
            List<UserInfo> usersInfo;

            public ConfirmEmailController()
            {
                // Load all UserInfo objects from a file
                XmlSerializer serializer = new XmlSerializer(typeof(List<UserInfo>));
                using (StreamReader reader = new StreamReader(passwordFileXml))
                {
                    var deserializedFile = serializer.Deserialize(reader);
                    if (deserializedFile != null)
                        usersInfo = (List<UserInfo>)deserializedFile;
                    else
                        usersInfo = new List<UserInfo>();
                }
            }

            // TODO: Move this into an external file
            private string CreateToken(string? username, string? emailAddress, string? userRole, string? authentication)
            {
                if (username == null) username = string.Empty;
                if (emailAddress == null) emailAddress = string.Empty;
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

            [HttpPost]
            public string ConfirmEmailAddress([FromBody] EmailConfirmationInfo confirmationInfo)
            {
                if (confirmationInfo.userId <= usersInfo.Count
                    && confirmationInfo.userId.HasValue
                    && usersInfo[confirmationInfo.userId.Value - 1] != null
                    && !string.IsNullOrEmpty(usersInfo[confirmationInfo.userId.Value - 1].emailConfirmationGuid)
                    && usersInfo[confirmationInfo.userId.Value - 1].emailConfirmationGuid == confirmationInfo.emailConfirmationGuid)
                {
                    usersInfo[confirmationInfo.userId.Value - 1].emailConfirmed = true;

                    // TODO: Save usersInfo
                    // TODO: Update JWT Token
                    UserInfo userInfo = usersInfo[confirmationInfo.userId.Value - 1];
                    return CreateToken(userInfo.username, userInfo.emailAddress, userInfo.userRole, "Authenticated");
                }

                return string.Empty;
            }
        }
    }
}

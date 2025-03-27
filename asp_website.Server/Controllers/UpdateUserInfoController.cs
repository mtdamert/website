using asp_website.Server.Models;
using Microsoft.AspNetCore.Mvc;
using System.Xml.Serialization;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;


namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UpdateUserInfoController : ControllerBase
    {
        const string passwordFileXml = "passwordsXml.txt";
        List<UserInfo> usersInfo;

        public UpdateUserInfoController()
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
        public string UpdateUserInfo(UpdateUserInfoFields updateFields)
        {
            if (updateFields != null && updateFields.emailAddress != null)
            {
                // For now, all that can be updated is username
                UserInfo userInfo = usersInfo.FirstOrDefault(info =>
                    info.emailAddress != null && updateFields.emailAddress != null && info.emailAddress == updateFields.emailAddress);
                if (userInfo != null)
                {
                    if (!string.IsNullOrWhiteSpace(updateFields.username))
                    {
                        userInfo.username = updateFields.username;
                    }
                    if (!string.IsNullOrWhiteSpace(updateFields.password))
                    {
                        // TODO: Create new salt and new salted hash
                        userInfo.salt = RandomNumberGenerator.GetBytes(16);
                        byte[] passwordBytes = Encoding.UTF8.GetBytes(updateFields.password);
                        userInfo.saltedHash = WebsiteUser.GenerateSaltedHash(passwordBytes, userInfo.salt);
                    }

                    // TODO: Save file
                    WebsiteUser.SaveAllUserInfo(usersInfo);

                    return CreateToken(userInfo.username, userInfo.emailAddress, userInfo.userRole, userInfo.emailConfirmed ? "Authenticated" : string.Empty);
                }

                // TODO - what if the user updates their password? 
            }

            return "";
        }
    }
}

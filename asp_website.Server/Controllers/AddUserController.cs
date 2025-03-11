using Microsoft.AspNetCore.Mvc;
using asp_website.Server.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SendGrid.Helpers.Mail;
using SendGrid;

namespace asp_website.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AddUserController : ControllerBase
    {
        private User user;
        private IConfiguration appSetting;

        public AddUserController()
        {
            user = new User();
            appSetting = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json")
                    .Build();
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
        public async Task<string> Post([FromBody] LogonCredentials newCredentials)
        {
            if (newCredentials != null && !string.IsNullOrWhiteSpace(newCredentials.username)
                && !string.IsNullOrWhiteSpace(newCredentials.emailAddress)
                && !string.IsNullOrWhiteSpace(newCredentials.password))
            {
                UserInfo? newUserInfo = user.AddUser(newCredentials.username, newCredentials.emailAddress, newCredentials.password);
                if (newUserInfo != null)
                {
                    // Send confirmation email. Include GUID and userID
                    string? apiKey = appSetting.GetValue<string>("SENDGRID_API_KEY", string.Empty);
                    SendGridClient client = new SendGridClient(apiKey);
                    EmailAddress from_email = new EmailAddress("mike@mtdamert.com", "mtdamert.com");

                    string subject = "Welcome to mtdamert.com!";
                    EmailAddress to_email = new EmailAddress(newCredentials.emailAddress);

                    string emailText = string.Empty;
                    // TODO: Add email body
                    emailText += "http://mtdamert.com/ConfirmEmail?id=" + newUserInfo.userId + "&emailConfirmationGuid=" + newUserInfo.emailConfirmationGuid;

                    string plainTextContent = emailText;
                    string htmlContent = emailText;
                    SendGridMessage msg = MailHelper.CreateSingleEmail(from_email, to_email, subject, plainTextContent, htmlContent);
                    Response response = await client.SendEmailAsync(msg).ConfigureAwait(false);

                    return CreateToken(newCredentials.username, newCredentials.emailAddress, UserInfo.Client, string.Empty);
                }
            }

            this.HttpContext.Response.StatusCode = 401;
            return string.Empty;
        }

    }
}
